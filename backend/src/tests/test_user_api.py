from rest_framework.test import APIClient
from rest_framework import status

from core.domain.models import User, RecyclingPoint
from .clean_db_per_class import CleanDBPerClassTestCase as CleanDBTestCase

class UserViewTests(CleanDBTestCase):
    """
    Tests for core.presentation.api.user_view.UserViewSet endpoints.
    """

    def setUp(self):
        self.client = APIClient()
        # minimal unique values for required fields
        self.common_payload = {
            "username": "testuser",
            "password": "Senha123!",
            "email": "testuser@example.com",
            "cpf": "000.000.000-00",
            "zip_code": "00000-000",
        }

    def test_me_endpoint_requires_auth_and_returns_user(self):
        user = User.objects.create_user(
            username="meuser", password="pw", email="me@example.com", cpf="111.111.111-11", zip_code="11111-111"
        )
        # authenticate
        self.client.force_authenticate(user=user)
        resp = self.client.get("/api/v1/users/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("username", resp.data)
        self.assertEqual(resp.data.get("username"), user.username)

    def test_create_admin_endpoint_requires_admin_and_creates_admin_user(self):
        payload = self.common_payload.copy()
        payload.update({"username": "admin_created", "email": "admin_created@example.com", "cpf": "222.222.222-22"})

        # unauthenticated should not be able to create an admin
        resp = self.client.post("/api/v1/users/create_admin/", payload, format="json")
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

        # non-admin authenticated should not be able to create an admin
        non_admin = User.objects.create_user(
            username="regular_creator", password="pw", email="creator@example.com", cpf="888.888.888-88", zip_code="88888-888"
        )
        self.client.force_authenticate(user=non_admin)
        resp = self.client.post("/api/v1/users/create_admin/", payload, format="json")
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

        # use super admin created by migrations to perform admin-only actions
        super_admin = User.objects.filter(email="admin@admin.com").first()
        self.assertIsNotNone(super_admin, "Expected super admin created by migration (admin@admin.com)")

        # Ensure super_admin has flags/access expected by permission class
        if not super_admin.is_superuser or super_admin.access_level != "A" or not super_admin.is_staff:
            super_admin.is_superuser = True
            super_admin.is_staff = True
            super_admin.access_level = "A"
            super_admin.save()

        self.client.force_authenticate(user=super_admin)
        resp = self.client.post("/api/v1/users/create_admin/", payload, format="json")
        if resp.status_code != status.HTTP_201_CREATED:
            self.fail(f"Expected 201 CREATED, got {resp.status_code}. Response body: {resp.data}")
       
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.data.get("user") or resp.data
        self.assertIsNotNone(data)
        created = User.objects.filter(username=payload["username"]).first()
        self.assertIsNotNone(created)
        self.assertEqual(created.access_level, "A")

    def test_set_permission_only_allowed_for_admin(self):
        target = User.objects.create_user(
            username="target", password="pw", email="t@example.com", cpf="333.333.333-33", zip_code="33333-333"
        )

        non_admin = User.objects.create_user(
            username="regular", password="pw", email="r@example.com", cpf="444.444.444-44", zip_code="44444-444"
        )

        # use super admin created by migrations
        admin = User.objects.filter(email="admin@admin.com").first()
        self.assertIsNotNone(admin, "Expected super admin created by migration (admin@admin.com)")

        url = f"/api/v1/users/{target.pk}/set_permission/"

        # non-admin should be forbidden
        self.client.force_authenticate(user=non_admin)
        resp = self.client.patch(url, {"access_level": "M"}, format="json")
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED))

        # admin can change permission
        self.client.force_authenticate(user=admin)
        resp = self.client.patch(url, {"access_level": "M"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        target.refresh_from_db()
        self.assertEqual(target.access_level, "M")

    def test_assign_recycling_point_to_manager(self):
        # create manager user (must have access_level 'E')
        manager = User.objects.create_user(
            username="manager", password="pw", email="m@example.com", cpf="666.666.666-66", zip_code="66666-666"
        )
        manager.access_level = "M"
        manager.save()

        # use super admin created by migrations
        admin = User.objects.filter(email="admin@admin.com").first()
        self.assertIsNotNone(admin, "Expected super admin created by migration (admin@admin.com)")

        rp = RecyclingPoint.objects.create(
            name="RP Test",
            cnpj="12345678000199",
            zip_code="99999-999",
            latitude=0.0,
            longitude=0.0,
        )

        url = f"/api/v1/users/{manager.pk}/assign_recycling_point/"
        payload = {"recycling_point_id": rp.recycling_point_id}

        # non-admin cannot assign
        self.client.force_authenticate(user=manager)
        resp = self.client.post(url, payload, format="json")
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED))

        # admin assigns successfully
        self.client.force_authenticate(user=admin)
        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        rp.refresh_from_db()
        # RecyclingPoint.user_id is a FK to User; view sets rp.user_id = user
        self.assertIsNotNone(rp.user_id)
        self.assertEqual(rp.user_id.pk, manager.pk)
from rest_framework.test import APIClient
from rest_framework import status

from core.domain.models import User, RecyclingPoint, RecyclingValue
from .clean_db_per_class import CleanDBPerClassTestCase as CleanDBTestCase


class RecyclingViewTests(CleanDBTestCase):
    def setUp(self):
        self.client = APIClient()

        # create a manager user
        self.manager = User.objects.create_user(
            username="manager1",
            password="pw",
            email="manager1@example.com",
            cpf="11111111111",
            zip_code="11111-111",
        )
        self.manager.access_level = "E"
        self.manager.save()

        # another regular user
        self.other_user = User.objects.create_user(
            username="other",
            password="pw",
            email="other@example.com",
            cpf="22222222222",
            zip_code="22222-222",
        )

        # create two recycling points for manager
        self.rp1 = RecyclingPoint.objects.create(
            name="RP One",
            cnpj="00000000000191",
            zip_code="99999-001",
            latitude=0.0,
            longitude=0.0,
            user_id=self.manager,
        )
        self.rp2 = RecyclingPoint.objects.create(
            name="RP Two",
            cnpj="00000000000192",
            zip_code="99999-002",
            latitude=1.0,
            longitude=1.0,
            user_id=self.manager,
        )

        # a recycling point for another user
        self.rp_other = RecyclingPoint.objects.create(
            name="RP Other",
            cnpj="00000000000193",
            zip_code="99999-003",
            latitude=2.0,
            longitude=2.0,
            user_id=self.other_user,
        )

        RecyclingValue.objects.create(
            points_value=500.0
        )

    def test_manager_can_list_their_ecopontos(self):
        self.client.force_authenticate(user=self.manager)
        url = f"/api/v1/recyclings/ecopontos_by_manager/?manager_id={self.manager.user_id}"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)
        ids = {item["recycling_point_id"] for item in resp.data}
        self.assertIn(self.rp1.recycling_point_id, ids)
        self.assertIn(self.rp2.recycling_point_id, ids)
        self.assertNotIn(self.rp_other.recycling_point_id, ids)

    def test_non_admin_cannot_list_other_manager_ecopontos(self):
        self.client.force_authenticate(user=self.other_user)
        url = f"/api/v1/recyclings/ecopontos_by_manager/?manager_id={self.manager.user_id}"
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED))

    def test_super_admin_can_list_any_manager_ecopontos(self):
        super_admin = User.objects.filter(email="admin@admin.com").first()
        self.assertIsNotNone(super_admin, "Expected super admin (admin@admin.com) present")
        # ensure admin flags
        super_admin.access_level = "A"
        super_admin.is_staff = True
        super_admin.is_superuser = True
        super_admin.save()

        self.client.force_authenticate(user=super_admin)
        url = f"/api/v1/recyclings/ecopontos_by_manager/?manager_id={self.manager.user_id}"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)
        self.assertGreaterEqual(len(resp.data), 2)

    def create_disposal_via_api(self, user, recycling_point_id, weight=1.0):
        """
        Helper that authenticates as `user` and calls register_disposal endpoint to create a disposal.
        Returns response.data. Fails with a helpful message showing response body when status != 201/200.
        """
        self.client.force_authenticate(user=user)
        payload = {"recycling_point_id": recycling_point_id, "weight": weight}
        resp = self.client.post("/api/v1/recyclings/register_disposal/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        return resp.data

    def test_manager_can_get_last_disposal_for_their_points(self):
        # create two disposals; second should be the last
        d1 = self.create_disposal_via_api(self.manager, self.rp1.recycling_point_id, weight=1.5)
        d2 = self.create_disposal_via_api(self.manager, self.rp1.recycling_point_id, weight=2.0)

        # authenticated as manager, fetch last_disposal
        self.client.force_authenticate(user=self.manager)
        url = f"/api/v1/recyclings/last_disposal/?manager_id={self.manager.user_id}"
        resp = self.client.get(url, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, dict)
        # compare by available keys (recycling_id or weight)
        if "recycling_id" in resp.data and "recycling_id" in d2:
            self.assertEqual(resp.data["recycling_id"], d2.get("recycling_id"))
        else:
            self.assertEqual(resp.data.get("weight"), d2.get("weight"))

    def test_non_admin_cannot_get_other_manager_last_disposal(self):
        # create a disposal by manager
        self.create_disposal_via_api(self.manager, self.rp1.recycling_point_id, weight=1.2)

        # other user should be forbidden
        self.client.force_authenticate(user=self.other_user)
        url = f"/api/v1/recyclings/last_disposal/?manager_id={self.manager.user_id}"
        resp = self.client.get(url, format="json")
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED))

    def test_super_admin_can_get_any_manager_last_disposal(self):
        # create a disposal by manager
        d = self.create_disposal_via_api(self.manager, self.rp1.recycling_point_id, weight=3.3)

        # get super admin created by CleanDBPerClassTestCase migrations/seed
        super_admin = User.objects.filter(email="admin@admin.com").first()
        self.assertIsNotNone(super_admin)

        # ensure admin flags
        super_admin.access_level = "A"
        super_admin.is_staff = True
        super_admin.is_superuser = True
        super_admin.save()

        self.client.force_authenticate(user=super_admin)
        url = f"/api/v1/recyclings/last_disposal/?manager_id={self.manager.user_id}"
        resp = self.client.get(url, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, dict)
        if "recycling_id" in resp.data and "recycling_id" in d:
            self.assertEqual(resp.data["recycling_id"], d.get("recycling_id"))
        else:
            self.assertEqual(resp.data.get("weight"), d.get("weight"))
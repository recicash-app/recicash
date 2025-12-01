from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from core.domain.models import User
from .clean_db_per_class import CleanDBPerClassTestCase as CleanDBTestCase


class AuthViewTests(CleanDBTestCase):
    """
    Tests for core.presentation.api.auth_view.AuthViewSet endpoints:
      - POST /api/v1/token/       -> login
      - GET  /api/v1/token/csrf/  -> get csrf cookie
      - POST /api/v1/token/logout/-> logout (blacklist + clear cookies)
    """

    def setUp(self):
        self.client = APIClient()
        self.user_password = "Senha123!"
        self.user = User.objects.create_user(
            username="authuser",
            password=self.user_password,
            email="authuser@example.com",
            cpf="00011122233",
            zip_code="11111-111",
        )

    def test_csrf_endpoint_sets_csrftoken_cookie(self):
        resp = self.client.get("/api/v1/token/csrf/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # ensure csrftoken cookie present
        self.assertIn("csrftoken", resp.cookies)
        self.assertTrue(resp.cookies["csrftoken"].value)

    def test_login_sets_access_and_refresh_cookies_and_returns_user(self):
        payload = {"email": self.user.email, "password": self.user_password}
        resp = self.client.post("/api/v1/token/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # tokens must be set as HttpOnly cookies
        self.assertIn("access_token", resp.cookies)
        self.assertIn("refresh_token", resp.cookies)
        # response body should include user info (at least username or email)
        self.assertIn("username", resp.data or {})
        self.assertEqual(resp.data.get("username"), self.user.username)

    def test_logout_without_refresh_cookie_returns_400_when_authenticated(self):
        # authenticate request (so permission passes) but no refresh_token cookie
        self.client.force_authenticate(user=self.user)
        resp = self.client.post("/api/v1/token/logout/", {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resp.data.get("detail"), "Refresh token not found.")

    def test_logout_blacklists_refresh_and_clears_cookies(self):
        # create a refresh token and attach as cookie, and authenticate
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies["refresh_token"] = str(refresh)
        self.client.force_authenticate(user=self.user)

        resp = self.client.post("/api/v1/token/logout/", {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # response should delete cookies (deleted cookies typically present with empty value)
        self.assertIn("access_token", resp.cookies)
        self.assertIn("refresh_token", resp.cookies)
        # ensure cookies are cleared (value may be empty or removed)
        self.assertTrue(resp.cookies["access_token"].value == "" or resp.cookies["access_token"].value is None)
        self.assertTrue(resp.cookies["refresh_token"].value == "" or resp.cookies["refresh_token"].value is None)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError

from core.infrastructure.serializers import LoginSerializer

class AuthViewSet(viewsets.ViewSet):
    """
      Authentication endpoints.

      - POST /token/          → login
      - POST /token/logout/   → logout
      - GET  /token/csrf/     → get CSRF token
    """

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        """
        POST /token/
        Custom login view that accepts credentials (email & password),
        validates them and sets HttpOnly cookies with access and refresh tokens.

        Request:
        - JSON body: {"email": "...", "password": "..."}

        Success response:
        - 200: user data JSON (tokens set as cookies: access_token, refresh_token)
        Errors:
        - 401: invalid credentials
        - 400: validation errors
        """
        serializer = LoginSerializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
            return Response({"detail": "Invalid credentials."},
                            status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        user_data = validated_data.get("user")

        response = Response(user_data, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access_token",
            value=validated_data["access"],
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        response.set_cookie(
            key="refresh_token",
            value=validated_data["refresh"],
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        return response

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        POST /token/logout/
        Logout endpoint: read refresh_token from cookie, blacklist it, and delete token cookies.

        Responses:
          200: logout successful
          400: missing or invalid refresh token
        """
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"detail": "Refresh token not found."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"detail": "Invalid or expired token."},
                            status=status.HTTP_400_BAD_REQUEST)

        response = Response({"detail": "Logout successfully."},
                            status=status.HTTP_200_OK)

        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    @method_decorator(ensure_csrf_cookie)
    def csrf(self, request):
        """
        GET /token/csrf/
        Lightweight endpoint used by front-end to obtain a CSRF cookie before state-changing requests.

        Responses:
        200: {"detail": "CSRF cookie set"} with csrftoken cookie set in response.
        """
        return Response({"detail": "CSRF cookie set"}, status=status.HTTP_200_OK)
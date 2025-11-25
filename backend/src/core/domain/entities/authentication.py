from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomJWTAuthentication(JWTAuthentication):
    """
    Authentication that reads Access Token from a HttpOnly cookie.
    """
    def authenticate(self, request):
        # Catch 'access_token' from cookie
        access_token = request.COOKIES.get('access_token')

        if not access_token:
            return None # No token, user not authenticated

        try:
            # Validate token
            validated_token = self.get_validated_token(access_token)
            # Get user
            return self.get_user(validated_token), validated_token
        except Exception:
            return None # Invalid or expired token
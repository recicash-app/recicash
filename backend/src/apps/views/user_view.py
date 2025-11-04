from apps.entities.models import User
from apps.entities.serializers import UserSerializer, UserObtainPairSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import viewsets, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView 

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Define permissions for different roles
        """
        if self.action == 'create':
            # Allows anyone to create a new user
            permission_classes = [AllowAny]
        else:
            # Demands authentication for other roles than 'create'
            permission_classes = [IsAuthenticated]
            
        return [permission() for permission in permission_classes]


class UserObtainPairView(TokenObtainPairView): 
    """
    Customized login view that uses email instead of username.
    Validate credentials and define access tokens and refresh token as HttpOnly cookies.
    """
    serializer_class = UserObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            # Try to validate credentials
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
             # Invalid credential
             return Response({"detail": "Invalid credentials."}, 
                             status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
             # Others validations errors (ex: bad formatted email)
             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Get data if successfully validation
        validated_data = serializer.validated_data
        
        # Get user data from serializer 
        user_data = validated_data.get('user')

        # Create response with user data without tokens
        response = Response(user_data, status=status.HTTP_200_OK)

        # HttpOnly Cookies definitions

        # Access Token Cookie
        response.set_cookie(
            key='access_token',
            value=validated_data['access'],
            httponly=True,       # Protection XSS
            secure=False,        # False to development in HTTP.
            samesite='Lax',      # Protection CSRF. 'Strict' is safer.
            path='/'             # Available in whole website
        )
        
        # Refresh Token Cookie
        response.set_cookie(
            key='refresh_token',
            value=validated_data['refresh'],
            httponly=True,
            secure=False,         # False to development in HTTP.
            samesite='Lax', 
            path='/'
        )
        
        return response
    
class LogoutView(APIView):
    """
    Logout View.
    Read 'refresh_token' from cookie, put it in blacklist,
    and delete cookies 'access' and 'refresh' from response.
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(csrf_protect) # Guarantee that X-CSRFToken header is verified
    def post(self, request, *args, **kwargs):
        
        # Get refresh token from cookie
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
             return Response({"detail": "Refresh token not found."}, 
                             status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Add to blacklist
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        except TokenError:
            return Response({"detail": "Invalid or expired token."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Create response and delete cookies
        response = Response({"detail": "Logout successfully."}, 
                            status=status.HTTP_200_OK)
        
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')

        return response
    

class GetCSRFToken(APIView):
    """
    "Empty" view" only used to "priming".
    Front-end does a GET here before login, so Django can send 'csrftoken' token in response.
    """
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        return Response({"detail": "CSRF cookie set"}, status=status.HTTP_200_OK)
from rest_framework import views, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.entities.models import User
from apps.entities.serializers import UserSerializer, UserObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserObtainPairView(TokenObtainPairView):
    """
    Customized login view to accept email instead of username.
    """
    serializer_class = UserObtainPairSerializer


class LogoutView(views.APIView):
    """
    Logout endpoint
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            
            if not refresh_token:
                 return Response({"detail": "Refresh token was not given."}, 
                                 status=status.HTTP_400_BAD_REQUEST)
            
            # Create RefreshToken
            token = RefreshToken(refresh_token)
            
            # Add token to blacklist
            token.blacklist()

            return Response({"detail": "Successful logout."}, 
                            status=status.HTTP_200_OK)
        
        except TokenError:
            return Response({"detail": "Invalid or expired token."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, 
                            status=status.HTTP_400_BAD_REQUEST)
    
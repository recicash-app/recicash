from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.entities.models import User
from apps.entities.serializers import UserSerializer, UserObtainPairSerializer
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
    View de login customizada que usa email em vez de username.
    """
    serializer_class = UserObtainPairSerializer
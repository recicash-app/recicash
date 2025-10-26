from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.entities.models import User
from apps.entities.serializers import UserSerializer, UserObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserObtainPairView(TokenObtainPairView):
    """
    View de login customizada que usa email em vez de username.
    """
    serializer_class = UserObtainPairSerializer
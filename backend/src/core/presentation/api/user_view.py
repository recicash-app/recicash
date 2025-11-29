from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from core.domain.models import User, RecyclingPoint
from core.infrastructure.permissions import IsAppAdminUser
from core.infrastructure.serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    Users endpoint.

    Standard routes (registered via router):
      - GET /users/           : list users (auth required)
      - POST /users/          : create user (AllowAny if create action used)
      - GET /users/{pk}/      : retrieve user
      - PUT/PATCH /users/{pk}/: update user
      - DELETE /users/{pk}/   : delete user

    Custom actions:
      - GET  /users/me/                       : return current authenticated user (auth required)
      - POST /users/create_admin/             : create an admin user (admin only)
      - POST /users/create_manager/           : create a recycling point manager (admin only)
      - PATCH /users/{pk}/set_permission/     : set access_level for a user (admin only)
      - POST  /users/{pk}/assign_recycling_point/ : assign recycling point to manager (admin only)
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Return permission instances based on action.

        Rules:
          - create: AllowAny (used for public sign-up endpoints)
          - set_permission, assign_recycling_point, create_admin, create_manager:
              IsAuthenticated + IsAppAdminUser
          - me: IsAuthenticated
          - default: IsAuthenticated
        """
        if self.action in ['create']:
            return [AllowAny()]

        if self.action in [
            'get'
            'set_permission', 
            'assign_recycling_point',
            'create_admin', 'create_manager'
        ]:
            return [IsAuthenticated(), IsAppAdminUser()]

        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        GET /users/me/
        Return the authenticated user's serialized data.

        Returns:
          200: user object
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAppAdminUser])
    def create_admin(self, request):
        """
        POST /users/create_admin/
        Create a user with administrator access_level ('A').

        Payload:
          - username, password, email, cpf, zip_code, etc.

        Responses:
          201: created user data
          400: validation errors
        """
        data = request.data.copy()
        data['access_level'] = 'A'

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Admin created.", "user": UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAppAdminUser])
    def create_manager(self, request):
        """
        POST /users/create_manager/
        Create a recycling point manager (access_level 'E').

        Payload:
          - username, password, email, cpf, zip_code, etc.

        Responses:
          201: created user data
          400: validation errors
        """
        data = request.data.copy()
        data['access_level'] = 'E'

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Recycling point manager created.", "user": UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def set_permission(self, request, pk=None):
        """
        PATCH /users/{pk}/set_permission/
        Update a user's access_level.

        Payload:
          - access_level: one of ['U','A','E']

        Responses:
          200: updated user
          400: invalid access level
          404: user not found (handled by get_object)
        """
        user = self.get_object()

        new_level = request.data.get("access_level")

        if new_level not in ['U', 'A', 'E']:
            return Response(
                {"error": "Invalid access level. Must be U, A or E."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.access_level = new_level
        user.save()

        return Response(
            {"message": "User permission updated.", "user": UserSerializer(user).data},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def assign_recycling_point(self, request, pk=None):
        """
        POST /users/{pk}/assign_recycling_point/
        Assign a recycling point to a manager user.

        Requirements:
          - target user must have manager access_level ('E')
          - payload: {"recycling_point_id": <id>}

        Responses:
          200: success with recycling_point id
          400: validation error (wrong user role)
          404: recycling point not found
        """
        user = self.get_object()

        if user.access_level != 'E':
            return Response(
                {"error": "Only users with level E can be assigned to a recycling point."},
                status=status.HTTP_400_BAD_REQUEST
            )

        rp_id = request.data.get("recycling_point_id")

        try:
            rp = RecyclingPoint.objects.get(recycling_point_id=rp_id)
        except RecyclingPoint.DoesNotExist:
            return Response(
                {"error": "Recycling point not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # update the representative
        rp.user_id = user
        rp.save()

        return Response(
            {"message": "Recycling point assigned to manager.", "recycling_point": rp_id},
            status=status.HTTP_200_OK
        )
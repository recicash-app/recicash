from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated, AllowAny

from core.domain.models import User, RecyclingPoint
from core.infrastructure.permissions import IsAppAdminUser
from core.infrastructure.serializers import UserSerializer
from core.application.use_cases import PaginatorService

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
            'list'
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


    def list(self, request, *args, **kwargs):
        """
        List posts. Supports optional pagination via query params:
          - page (int)
          - page_size (int)

        When pagination params are provided, uses PaginatorService and returns
        a paginated dict with 'results' replaced by serialized users.
        """
        queryset = self.get_queryset()
        page = request.query_params.get("page")
        page_size = request.query_params.get("page_size")

        if page and page_size:
            paginator = PaginatorService(
                queryset=queryset,
                page=int(page),
                page_size=int(page_size)
            )
            data = paginator.get_paginated_data()
            data["results"] = UserSerializer(
                data["results"], many=True, context={"request": request}
            ).data
            return Response(data, status=status.HTTP_200_OK)

        serializer = UserSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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
        Create a recycling point manager (access_level 'M').

        Payload:
          - username, password, email, cpf, zip_code, etc.

        Responses:
          201: created user data
          400: validation errors
        """
        data = request.data.copy()
        data['access_level'] = 'M'

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
          - access_level: one of ['U','A','M']

        Responses:
          200: updated user
          400: invalid access level
          404: user not found (handled by get_object)
        """
        user = self.get_object()

        new_level = request.data.get("access_level")

        if new_level not in ['U', 'A', 'M']:
            return Response(
                {"error": "Invalid access level. Must be U, A or M."},
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
          - target user must have manager access_level ('M')
          - payload: {"recycling_point_id": <id>}

        Responses:
          200: success with recycling_point id
          400: validation error (wrong user role)
          404: recycling point not found
        """
        user = self.get_object()

        if user.access_level != 'M':
            return Response(
                {"error": "Only users with level M can be assigned to a recycling point."},
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        """
        POST /users/{pk}/change_password/
        Payload:
            current_password
            new_password
            confirm_password
        """
        user = self.get_object()

        current = request.data.get("current_password")
        new = request.data.get("new_password")
        confirm = request.data.get("confirm_password")

        if not user.check_password(current):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if new != confirm:
            return Response({"error": "New password and confirmation do not match."}, status=status.HTTP_400_BAD_REQUEST)

        if not new or len(new) < 6:
            return Response({"error": "New password must be at least 6 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new)
        user.save()

        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)

from datetime import datetime

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

from core.domain.models import Recycling, RecyclingPoint, RecyclingValue, User, WalletHistory, Wallet
from core.infrastructure.serializers import RecyclingSerializer


class RecyclingViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for Recycling.

    Supported endpoints (mounted under router, e.g. /api/v1/recyclings/):
    - GET /           -> list all recycling records (paginated)
    - GET /{id}/      -> retrieve a single recycling record
    - POST /          -> create a new recycling record
    - PATCH /{id}/    -> partial update (only specific fields)
    - DELETE /{id}/   -> delete a recycling record

    Notes:
    - POST requires: user_id, recycling_point_id, recycling_value_id, weight, validation_hash
    - points_value is automatically calculated from recycling_value_id
    - date is automatically set on creation
    - A WalletHistory record is created with operation='RECYCLING' and value=points_value
    """

    queryset = Recycling.objects.all().order_by('-date')
    serializer_class = RecyclingSerializer

    def get_permissions(self):
        """
        Define permissions for different actions.
        
        Current behavior:
        - list, retrieve -> AllowAny (public read)
        - create, update, delete -> AllowAny (for local testing)
        
        To require authentication in production, replace with:
            return [IsAuthenticated()]
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]  # Change to [IsAuthenticated] in production

        return [permission() for permission in permission_classes]
    

    def get_queryset(self):
        """
        Filter recycling records to only show the authenticated user's records.
        Prevents users from seeing recycling records of other users.

        API Usage: 
        - GET /api/v1/recyclings/?user_id={user_id}
        - GET /api/v1/recyclings/?start_date={start_date}
        - GET /api/v1/recyclings/?end_date={end_date}
        - GET /api/v1/recyclings/?min_points={min_points}
        - GET /api/v1/recyclings/?max_points={max_points}
        - Optional filters:
            - start_date: ISO format (YYYY-MM-DDTHH:MM:SS) date string to filter records from this date onwards
            - end_date: ISO format (YYYY-MM-DDTHH:MM:SS) date string to filter records up to this date
            - min_points: integer to filter records with points_value >= min_points
            - max_points: integer to filter records with points_value <= max_points
        """
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id', None)
        
        # Validate that the user_id provided matches the authenticated user
        if not user_id:
            return queryset.none()
        
        try:
            requested_user_id = int(user_id)
        except (ValueError, TypeError):
            return queryset.none()
        
        # Get the authenticated user's ID from the request
        if self.request.user and self.request.user.is_authenticated:
            # Assuming the user object has a user_id attribute
            authenticated_user_id = self.request.user.user_id
            
            # Only allow users to see their own recycling records
            if authenticated_user_id != requested_user_id:
                return queryset.none()
        else:
            return queryset.none()
        
        queryset = queryset.filter(user_id__user_id=requested_user_id)
        
        # Filter by date if provided
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            try:
                start_date_obj = datetime.fromisoformat(start_date)
                queryset = queryset.filter(date__gte=start_date_obj)
            except (ValueError, TypeError):
                pass  # Ignore invalid date format
        
        if end_date:
            try:
                end_date_obj = datetime.fromisoformat(end_date)
                queryset = queryset.filter(date__lte=end_date_obj)
            except (ValueError, TypeError):
                pass  # Ignore invalid date format
        
        # Filter by points if provided
        min_points = self.request.query_params.get('min_points', None)
        max_points = self.request.query_params.get('max_points', None)
        
        if min_points:
            try:
                min_points_value = int(min_points)
                queryset = queryset.filter(points_value__gte=min_points_value)
            except (ValueError, TypeError):
                pass  # Ignore invalid points format
        
        if max_points:
            try:
                max_points_value = int(max_points)
                queryset = queryset.filter(points_value__lte=max_points_value)
            except (ValueError, TypeError):
                pass  # Ignore invalid points format
        
        return queryset
    

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single recycling record.
        Only allow users to see their own recycling records.
        """
        instance = self.get_object()
        user_id = request.query_params.get('user_id', None)
        
        # Validate that the user_id provided matches the authenticated user
        if not user_id:
            return Response(
                {"error": "user_id parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            requested_user_id = int(user_id)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid user_id format."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the authenticated user's ID from the request
        if request.user and request.user.is_authenticated:
            authenticated_user_id = request.user.user_id
            
            # Only allow users to see their own recycling records
            if authenticated_user_id != requested_user_id or instance.user_id.user_id != requested_user_id:
                return Response(
                    {"error": "Unauthorized: You cannot access this recycling record."},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    

    def create(self, request, *args, **kwargs):
        """
        Create a new recycling record.
        
        Expected POST data:
        {
            "user_id": <integer>,
            "recycling_point_id": <integer>,
            "recycling_value_id": <integer>,
            "weight": <float>,
            "validation_hash": "<string>"
        }
        
        Note: points_value is automatically calculated from recycling_value.points_value * weight
        """
        # Validate that user, recycling_point, and recycling_value exist
        user_id = request.data.get('user_id')
        recycling_point_id = request.data.get('recycling_point_id')
        recycling_value_id = request.data.get('recycling_value_id')
        weight = request.data.get('weight')
        validation_hash = request.data.get('validation_hash')
        
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            recycling_point = RecyclingPoint.objects.get(recycling_point_id=recycling_point_id)
        except RecyclingPoint.DoesNotExist:
            return Response(
                {"error": "RecyclingPoint not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            recycling_value = RecyclingValue.objects.get(recycling_value_id=recycling_value_id)
        except RecyclingValue.DoesNotExist:
            return Response(
                {"error": "RecyclingValue not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not weight:
            return Response(
                {"error": "Weight is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not validation_hash:
            return Response(
                {"error": "Validation hash is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if validation_hash already exists
        if Recycling.objects.filter(validation_hash=validation_hash).exists():
            return Response(
                {"error": "Validation hash already exists. Cannot create duplicate recycling record."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate points_value: recycling_value.points_value * weight
        points_value = int(recycling_value.points_value * float(weight))
        
        # Prepare data for serializer
        data = request.data.copy()
        data['points_value'] = points_value
        
        serializer = self.get_serializer(data=data)
        
        if serializer.is_valid():
            self.perform_create(serializer)
            
            # Create a WalletHistory record
            WalletHistory.objects.create(
                user_id=user,
                operation='RECYCLING',
                value=points_value
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def record_wallet_history(self, request):
        """
        Custom action to find a Recycling record and update WalletHistory and Wallet.
        
        Expected POST data:
        {
            "recycling_id": <integer>
            "user_id": <integer>
        }
        
        This endpoint:
        1. Finds the Recycling record by recycling_id
        2. Creates a WalletHistory record with operation='RECYCLING'
        3. Updates the user's wallet points_balance
        """
        recycling_id = request.data.get('recycling_id')
        user_id = request.data.get('user_id')
        
        if not recycling_id:
            return Response(
                {"error": "recycling_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user_id:
            return Response(
                {"error": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            recycling = Recycling.objects.get(recycling_id=recycling_id)
        except Recycling.DoesNotExist:
            return Response(
                {"error": "Recycling record not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify if the user_id from request matches the recycling user_id
        if recycling.user_id.user_id != user_id:
            return Response(
                {"error": "Unauthorized: user_id does not match the recycling owner."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify if the recycling status is not REDEEMED
        if recycling.status == 'REDEEMED':
            return Response(
                {"error": "Recycling already redeemed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the user from the recycling record
        user = recycling.user_id
        
        if not user:
            return Response(
                {"error": "User not found for this recycling record."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
        # Update user's wallet points balance
        try:
            # Create WalletHistory record
            wallet_history = WalletHistory.objects.create(
                user_id=user,
                operation='RECYCLING',
                value=recycling.points_value
            )

            wallet = user.WALLET_USER
            wallet.points_balance += recycling.points_value
            wallet.save()
            
            # Update recycling status to REDEEMED
            recycling.status = 'REDEEMED'
            recycling.save()
        except Wallet.DoesNotExist:
            return Response(
                {"error": "Wallet not found for this user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        
        return Response(
            {
                "message": "WalletHistory record created and wallet updated successfully.",
                "wallet_history_id": wallet_history.history_id,
                "user_id": user.user_id,
                "points_added": recycling.points_value,
                "new_balance": wallet.points_balance
            },
            status=status.HTTP_201_CREATED
        )
    

    def perform_create(self, serializer):
        """
        Save the recycling record to the database.
        """
        serializer.save()

    def perform_update(self, serializer):
        """
        Update a recycling record.
        """
        serializer.save()

    def perform_destroy(self, instance):
        """
        Delete a recycling record.
        """
        instance.delete()

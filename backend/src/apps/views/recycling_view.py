from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.entities.models import Recycling, User, RecyclingPoint, RecyclingValue, WalletHistory, Wallet
from apps.entities.serializers import RecyclingSerializer


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
            permission_classes = [AllowAny]
        else:
            permission_classes = [AllowAny]  # Change to [IsAuthenticated] in production

        return [permission() for permission in permission_classes]

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

        # Validate that user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

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

        # Ensure user can only create records for their own account
        if request.user.user_id != user.user_id:
            return Response(
                {"error": "You can only create recycling records for your own account."},
                status=status.HTTP_403_FORBIDDEN
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
            
            # Update user's wallet points
            wallet, created = Wallet.objects.get_or_create(user_id=user)
            wallet.points_balance += points_value
            wallet.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

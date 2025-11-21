from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def record_wallet_history(self, request):
        """
        Custom action to find a Recycling record and update WalletHistory and Wallet.
        
        Expected POST data:
        {
            "recycling_id": <integer>
        }
        
        This endpoint:
        1. Finds the Recycling record by recycling_id
        2. Creates a WalletHistory record with operation='RECYCLING'
        3. Updates the user's wallet points_balance
        """
        recycling_id = request.data.get('recycling_id')
        
        if not recycling_id:
            return Response(
                {"error": "recycling_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            recycling = Recycling.objects.get(recycling_id=recycling_id)
        except Recycling.DoesNotExist:
            return Response(
                {"error": "Recycling record not found."},
                status=status.HTTP_404_NOT_FOUND
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
        
        # Create WalletHistory record
        wallet_history = WalletHistory.objects.create(
            user_id=user,
            operation='RECYCLING',
            value=recycling.points_value
        )
        
        # Update user's wallet points balance
        try:
            wallet = user.WALLET_USER
            wallet.points_balance += recycling.points_value
            wallet.save()
        except Wallet.DoesNotExist:
            return Response(
                {"error": "Wallet not found for this user."},
                status=status.HTTP_400_BAD_REQUEST
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

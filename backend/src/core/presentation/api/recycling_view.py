from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

from core.domain.models import Recycling, WalletHistory, Wallet, RecyclingPoint
from core.infrastructure.serializers import RecyclingSerializer, EcopontoDisposalSerializer
from core.application.use_cases.ecoponto_disposal_service import EcopontoDisposalService


class RecyclingViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for Recycling.

    Supported endpoints (mounted under router, e.g. /api/v1/recyclings/):
    - GET /           -> list all recycling records (paginated)
    - GET /{id}/      -> retrieve a single recycling record
    - POST /          -> create a new recycling record
    - PATCH /{id}/    -> partial update (only specific fields)
    - DELETE /{id}/   -> delete a recycling record

    Custom Actions:
    - POST /record_wallet_history/ -> update wallet after recycling validation
    - POST /register_disposal/ -> register disposal by recycling point without user

    Notes:
    - Standard POST requires: user_id, recycling_point_id, recycling_value_id, weight, validation_hash
    - register_disposal requires: recycling_point_id, weight (recycling_value_id optional)
    - points_value is automatically calculated from recycling_value_id
    - date is automatically set on creation
    - A WalletHistory record is created with operation='RECYCLING' and value=points_value only for recycling records associated with a user (i.e., when user_id is not NULL). For ecoponto disposals (registered via the register_disposal endpoint), no WalletHistory record is created.
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
            permission_classes = [IsAuthenticated]  # Change to [IsAuthenticated] in production

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

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def register_disposal(self, request):
        """
        Register a disposal by a recycling point (ecoponto).
        
        This endpoint allows recycling points to register disposals
        without associating them to specific users.
        
        Requires authentication. The authenticated user must be either:
        - The representative user of the recycling point (user_id matches), or
        - A user with 'M' (Recycling Point Manager) access level
        
        Expected POST data:
        {
            "recycling_point_id": <integer>,
            "weight": <float>,
            "recycling_value_id": <integer> (optional)
        }
        
        Returns:
        {
            "recycling_id": <integer>,
            "validation_hash": <string>,
            "points_value": <integer>,
            "weight": <float>,
            "date": <datetime>,
            "recycling_point_id": <integer>
        }
        """
        serializer = EcopontoDisposalSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        recycling_point_id = serializer.validated_data['recycling_point_id']
        
        # Verify the authenticated user is authorized to register disposals for this recycling point
        try:
            recycling_point = RecyclingPoint.objects.get(recycling_point_id=recycling_point_id)
        except RecyclingPoint.DoesNotExist:
            return Response(
                {"error": f"Recycling point with ID {recycling_point_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        is_representative = recycling_point.user_id == user
        is_manager = user.access_level == 'M'
        
        if not is_representative and not is_manager:
            return Response(
                {"error": "You are not authorized to register disposals for this recycling point."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            disposal_data = EcopontoDisposalService.register_disposal(
                recycling_point_id=serializer.validated_data['recycling_point_id'],
                weight=serializer.validated_data['weight'],
                recycling_value_id=serializer.validated_data.get('recycling_value_id')
            )
            
            return Response(disposal_data, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

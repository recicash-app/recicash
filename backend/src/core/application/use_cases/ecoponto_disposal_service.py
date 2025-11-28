import hashlib
import uuid
from datetime import datetime
from typing import Dict, Any
from core.domain.models import Recycling, RecyclingPoint, RecyclingValue


class EcopontoDisposalService:
    """
    Service to handle disposal registration by recycling points (ecopontos).
    
    This service allows recycling points to register disposals without
    associating them to specific users, generating a validation hash
    for later verification.
    """
    
    @staticmethod
    def register_disposal(
        recycling_point_id: int,
        weight: float,
        recycling_value_id: int = None
    ) -> Dict[str, Any]:
        """
        Register a disposal by a recycling point.
        
        Args:
            recycling_point_id: ID of the recycling point
            weight: Weight of the disposed material
            recycling_value_id: Optional ID of recycling value (defaults to latest)
            
        Returns:
            Dictionary containing:
            - recycling_id: ID of created recycling record
            - validation_hash: Generated hash for validation
            - points_value: Points value for this disposal
            - date: Registration timestamp
            
        Raises:
            ValueError: If recycling point doesn't exist or invalid data
        """
        
        # Validate recycling point exists
        try:
            recycling_point = RecyclingPoint.objects.get(
                recycling_point_id=recycling_point_id
            )
        except RecyclingPoint.DoesNotExist:
            raise ValueError(f"Recycling point with ID {recycling_point_id} not found")
        
        # Get recycling value (use latest if not specified)
        if recycling_value_id:
            try:
                recycling_value = RecyclingValue.objects.get(
                    recycling_value_id=recycling_value_id
                )
            except RecyclingValue.DoesNotExist:
                raise ValueError(f"Recycling value with ID {recycling_value_id} not found")
        else:
            recycling_value = RecyclingValue.objects.order_by('-date').first()
            if not recycling_value:
                raise ValueError("No recycling values configured in the system")
        
        # Validate weight
        if weight <= 0:
            raise ValueError("Weight must be greater than 0")
        
        # Calculate points
        points_value = int(weight * recycling_value.points_value)
        
        # Generate unique validation hash
        validation_hash = EcopontoDisposalService._generate_validation_hash(
            recycling_point_id=recycling_point_id,
            weight=weight,
            points_value=points_value
        )
        
        # Create recycling record without user association
        recycling = Recycling.objects.create(
            user_id=None,  # No user associated for ecoponto disposals
            recycling_point_id=recycling_point,
            recycling_value_id=recycling_value,
            points_value=points_value,
            weight=weight,
            validation_hash=validation_hash,
            status='ACTIVE'
        )
        
        return {
            'recycling_id': recycling.recycling_id,
            'validation_hash': validation_hash,
            'points_value': points_value,
            'weight': weight,
            'date': recycling.date,
            'recycling_point_id': recycling_point_id
        }
    
    @staticmethod
    def _generate_validation_hash(
        recycling_point_id: int,
        weight: float,
        points_value: int
    ) -> str:
        """
        Generate a unique validation hash for the disposal.
        
        Args:
            recycling_point_id: ID of the recycling point
            weight: Weight of disposed material
            points_value: Calculated points value
            
        Returns:
            Unique hash string for validation
        """
        # Create unique string combining data + timestamp + UUID
        unique_string = f"{recycling_point_id}_{weight}_{points_value}_{datetime.now().isoformat()}_{uuid.uuid4()}"
        
        # Generate SHA-256 hash
        hash_object = hashlib.sha256(unique_string.encode())
        
        return hash_object.hexdigest()[:8].upper()
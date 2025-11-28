from rest_framework import serializers
from core.domain.models import Recycling

class RecyclingSerializer(serializers.ModelSerializer):
    """
    Serializer for Recycling.
    
    Fields:
    - recycling_id: Primary key (read-only)
    - user_id: Foreign key to User
    - recycling_point_id: Foreign key to RecyclingPoint
    - recycling_value_id: Foreign key to RecyclingValue
    - points_value: Points earned from recycling
    - weight: Weight of recycled material
    - date: Recycling date (auto-generated, read-only)
    - validation_hash: Hash for validation
    """
    id = serializers.IntegerField(source='recycling_id', read_only=True)
    
    class Meta:
        model = Recycling
        fields = (
            'id',
            'user_id',
            'recycling_point_id',
            'recycling_value_id',
            'points_value',
            'weight',
            'date',
            'validation_hash'
        )
        read_only_fields = ('id', 'date')


class EcopontoDisposalSerializer(serializers.Serializer):
    """
    Serializer for ecoponto disposal registration.
    
    Used when recycling points register disposals without
    associating them to specific users.
    
    Fields:
    - recycling_point_id: ID of the recycling point (required)
    - weight: Weight of disposed material (required)
    - recycling_value_id: ID of recycling value (optional, uses latest if not provided)
    """
    recycling_point_id = serializers.IntegerField(
        help_text="ID of the recycling point registering the disposal"
    )
    weight = serializers.FloatField(
        min_value=0.01,
        help_text="Weight of the disposed material in kg"
    )
    recycling_value_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Optional ID of recycling value configuration (uses latest if not provided)"
    )
    
    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Weight must be greater than 0")
        return value

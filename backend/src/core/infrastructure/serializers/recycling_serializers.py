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

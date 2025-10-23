from rest_framework import serializers
from .models import Wallet

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = (
            'user_id',
            'points_balance'
        )
        read_only_fields = ('user_id', 'points_balance') # User cannot edit
from django.http import Http404
from rest_framework.generics import RetrieveAPIView
from .models import Wallet
from .serializers import WalletSerializer

class WalletByUserIdView(RetrieveAPIView):
    """
    Endpoint that allows wallets visualization or editing.
    This ViewSet gives GET, POST, PUT, DELETE endpoints.
    """

    # defines the serializer that will be used to format data
    serializer_class = WalletSerializer

    def get_object(self):

        # Gets user_id from URL request
        user_id = self.kwargs['user_id']

        try:
            wallet = Wallet.objects.get(user_id=user_id)
            return wallet
        except Wallet.DoesNotExist:
            raise Http404
from django.urls import path
from .views import WalletByUserIdView

urlpatterns = [
    # 💥 Usa path() em vez do Router para mapear a View simples
    path('wallets/<str:user_id>/', 
         WalletByUserIdView.as_view(), 
         name='wallet-by-user-id'),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.presentation.api import PostBlogViewSet
from core.presentation.api import RecyclingViewSet
from core.presentation.api import UserViewSet, UserObtainPairView, LogoutView, GetCSRFToken

# Router to ViewSets. It generates GET/POST/PUT/DELETE URLs automatically.
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'posts', PostBlogViewSet)
router.register(r'recyclings', RecyclingViewSet)

# The URL pattern is /api/[feat]/ and /api/[feat]/{pk}/
urlpatterns = [
    path('', include(router.urls)),

    path('token/', 
         UserObtainPairView.as_view(), 
         name='user_token_obtain_pair'
    ),

    path('token/logout/', 
         LogoutView.as_view(), 
         name='token_logout'
    ),
    path('token/csrf/', 
         GetCSRFToken.as_view(), 
         name='token_csrf'
    ),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.presentation.api import PostBlogViewSet
from core.presentation.api import RecyclingViewSet
from core.presentation.api.recycling_point_view import RecyclingPointViewSet
from core.presentation.api import UserViewSet, AuthViewSet


auth_view = AuthViewSet.as_view({ "post": "login" })
logout_view = AuthViewSet.as_view({ "post": "logout" })
csrf_view = AuthViewSet.as_view({ "get": "csrf" })

# Router to ViewSets. It generates GET/POST/PUT/DELETE URLs automatically.
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'posts', PostBlogViewSet)
router.register(r'recyclings', RecyclingViewSet)
router.register(r'recycling-points', RecyclingPointViewSet)

# The URL pattern is /api/v1/[feat]/ and /api/v1/[feat]/{pk}/
urlpatterns = [
    path('', include(router.urls)),
    path("token/", auth_view, name="user_token_obtain_pair"),
    path("token/logout/", logout_view, name="token_logout"),
    path("token/csrf/", csrf_view, name="token_csrf"),
]
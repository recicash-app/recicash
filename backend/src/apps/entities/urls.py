from rest_framework.routers import DefaultRouter
from apps.views.blog_view import PostBlogViewSet, PostImageViewSet

# Router to ViewSets. It generates GET/POST/PUT/DELETE URLs automatically.
router = DefaultRouter()
router.register(r'posts', PostBlogViewSet)
router.register(r'post-images', PostImageViewSet)

# The URL pattern is /api/[feat]/ e /api/[feat]/{pk}/
urlpatterns = router.urls
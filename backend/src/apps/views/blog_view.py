from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.entities.models import PostBlog, PostImage
from apps.entities.serializers import PostBlogSerializer
from apps.entities.permissions import IsAppAdminUser


class PostBlogViewSet(viewsets.ModelViewSet):
    # Gets all posts from blog
    queryset = PostBlog.objects.all()
    serializer_class = PostBlogSerializer

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAppAdminUser]
        
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user)

class PostImageViewSet(viewsets.ModelViewSet):
    queryset = PostImage.objects.all()
    serializer_class = PostBlogSerializer
from rest_framework import viewsets
from apps.entities.models import PostBlog
from apps.entities.serializers import PostBlogSerializer

class AllPostBlogViewSet(viewsets.ModelViewSet):
    # Gets all posts from blog
    queryset = PostBlog.objects.all()
    serializer_class = PostBlogSerializer
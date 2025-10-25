from rest_framework import serializers
from .models import PostBlog, PostImage
        
class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ('id', 'post_id', 'image')


class PostBlogSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)

    class Meta:
        model = PostBlog

        # Post blog field that will be shown
        fields = ('post_id', 'author_id', 'title', 'text', 'images', 'created_at', 'last_edition_date')
        # Fields that cannot be edited by user
        read_only_fields = ('author_id', 'created_at', 'last_edition_date')
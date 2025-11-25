from rest_framework import serializers
from core.domain.models import PostBlog, PostImage

class PostImageSerializer(serializers.ModelSerializer):
    """
    Serializer for PostImage.

    Fields:
    - id: DB id
    - image_url: absolute URL built from request context

    Validation:
    - Accepts files sent as multipart/form-data under field 'image'.
    - Add validate_image() here if you want size / mime checks.
    """
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PostImage
        fields = ['id', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

class PostBlogSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='post_id', read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = PostBlog
        fields = (
            'id',
            'title',
            'text',
            'images',
            'created_at',
            'last_edition_date'
        )
        read_only_fields = (
            'id',
            'created_at',
            'last_edition_date'
        )
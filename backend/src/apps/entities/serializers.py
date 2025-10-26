from rest_framework import serializers
from .models import PostBlog, PostImage
        
class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ('id', 'post', 'image')


class PostBlogSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = PostBlog

        # Post blog fields that will be shown
        fields = ('post_id', 'author_id', 'title', 'text',
                  'images', 'uploaded_images', 
                  'created_at', 'last_edition_date'
            )
        
        # Fields that cannot be edited by user
        read_only_fields = ('author_id', 'created_at', 'last_edition_date')
    
    def create(self, validated_data):
        """
        Overwrite 'create' method to deal with files
        sent in 'uploaded_images'
        """

        # Separate the images data from the rest of the data
        uploaded_images_data = validated_data.pop('uploaded_images', [])

        # Create BlogPost without the 'uploaded_images'
        post = PostBlog.objects.create(**validated_data)

        # Create and link up all images to the post
        for image_data in uploaded_images_data:
            PostImage.objects.create(post_id=post, image=image_data)
        
        return post
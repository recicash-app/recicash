from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from core.domain.models import User, PostBlog, PostImage, RecyclingPoint
import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'user_id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'cpf',
            'zip_code',
            'access_level'
        )
        read_only_fields = ('user_id', 'access_level')

        # Ensures that 'password' won't be return in GET requisitions
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        """
        Create and return a new User, hashing password.
        """
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # Hashes the password
        user.save()
        return user

    def update(self, instance, validated_data):
        """
        Update an User, hashing password if it is known.
        """
        
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.cpf = validated_data.get('cpf', instance.cpf)
        instance.zip_code = validated_data.get('zip_code', instance.zip_code)
        
        # Hash password
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance
    
    def validate_cpf(self, cpf):
        """
        Verify CPF format: XXX.XXX.XXX-XX.
        """
        cpf_regex = re.compile(r'^\d{3}\.\d{3}\.\d{3}\-\d{2}$')
        if not cpf_regex.match(cpf):
            raise serializers.ValidationError("Invalid CPF. The format required is XXX.XXX.XXX-XX.")
        
        return cpf
        
    def validate_password(self, value):
        """
        Verify password strength.
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must have at least 8 characters.")
        
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contains at least one number")
            
        if not any(char.isupper() for char in value):
             raise serializers.ValidationError("Password must have at least one capitalized letter")

        return value


class UserObtainPairSerializer(TokenObtainPairSerializer):
    
    def __init__(self, *args, **kwargs):
        """
        Change the serializer to accept 'email' instead of 'username'.
        """
        super().__init__(*args, **kwargs)
        # remove 'username' field
        self.fields.pop('username', None)
        # Add 'email' field
        self.fields['email'] = serializers.EmailField()

    def validate(self, attrs):
        """
        Credentials using email and password
        """
        email = attrs.get('email')
        password = attrs.get('password')

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials.')

        # verify password and 'is_active' status
        # 'authenticate' require USERNAME_FIELD
        user_auth = authenticate(
            username=user.username,
            password=password
        )

        if not user_auth:
            # Wrong password or inactive user
            raise serializers.ValidationError('Invalid credentials.')

        self.user = user_auth

        # Generate the tokens
        data = {}
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add extra data to login response
        data['user'] = {
            'user_id': self.user.user_id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'access_level': self.user.access_level,
        }

        return data


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


class RecyclingPointSerializer(serializers.ModelSerializer):
    """
    Serializer for RecyclingPoint basic information.
    
    Fields:
    - recycling_point_id: Unique identifier
    - name: Name of the recycling point
    - latitude: Geographic latitude
    - longitude: Geographic longitude
    - cnpj: Business registration number
    - zip_code: Postal code
    """
    class Meta:
        model = RecyclingPoint
        fields = (
            'recycling_point_id',
            'name',
            'latitude',
            'longitude',
            'cnpj',
            'zip_code'
        )
        read_only_fields = fields

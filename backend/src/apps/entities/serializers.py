from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

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
        user.set_password(password)  # Hashes password
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
        
        # Hashes password if it was sent in request
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance
    

class UserObtainPairSerializer(TokenObtainPairSerializer):
    
    def __init__(self, *args, **kwargs):
        """
        Modify serializer to accept 'email' instead of 'username'.
        """
        super().__init__(*args, **kwargs)
        # remove 'username'
        self.fields.pop('username', None)
        # add 'email'
        self.fields['email'] = serializers.EmailField()

    def validate(self, attrs):
        """
        Validate credentials using email and password.
        """
        email = attrs.get('email')
        password = attrs.get('password')

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials.')

        # Verify password and checks whether the user is active or not.
        user_auth = authenticate(
            username=user.username, # 'authenticate' requires USERNAME_FIELD.
            password=password
        )

        if not user_auth:
            # Incorrect password or inactive user
            raise serializers.ValidationError('Invalid credentials.')

        self.user = user_auth

        # Generate tokens
        data = {}
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add extra data to answer body
        data['user'] = {
            'user_id': self.user.user_id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'access_level': self.user.get_access_level_display,
        }

        return data
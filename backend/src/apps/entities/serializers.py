from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
import re
import logging

logger = logging.getLogger(__name__)

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
            raise serializers.ValidationError('Credenciais inválidas.')

        # verify password and 'is_active' status
        # 'authenticate' require USERNAME_FIELD
        user_auth = authenticate(
            username=user.username,
            password=password
        )

        if not user_auth:
            # Wrong password or inactive user
            raise serializers.ValidationError('Credenciais inválidas.')

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


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    Validates old password and new password.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        """
        Verify new password strength using same validation as UserSerializer.
        """
        #logger.info(f"validate_new_password foi chamado") -> for debug purposes

        if len(value) < 8:
            raise serializers.ValidationError("Password must have at least 8 characters.")
        
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contains at least one number")
            
        if not any(char.isupper() for char in value):
             raise serializers.ValidationError("Password must have at least one capitalized letter")

        return value
    
    def validate_old_password(self, value):
        """
        Validate that old password is correct for the current user.
        """
        #logger.info(f"validate_old_password foi chamado")
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
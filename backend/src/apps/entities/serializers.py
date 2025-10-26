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
        user.set_password(password)  # Hasheia a senha
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
        
        # Hasheia a senha se ela foi enviada na requisição
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance
    

class UserObtainPairSerializer(TokenObtainPairSerializer):
    
    def __init__(self, *args, **kwargs):
        """
        Modifica o serializer para aceitar 'email' em vez de 'username'.
        """
        super().__init__(*args, **kwargs)
        # Remove o campo 'username'
        self.fields.pop('username', None)
        # Adiciona o campo 'email'
        self.fields['email'] = serializers.EmailField()

    def validate(self, attrs):
        """
        Valida as credenciais usando email e senha.
        """
        email = attrs.get('email')
        password = attrs.get('password')

        # Encontra o usuário pelo email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Credenciais inválidas.')

        # Usa a função 'authenticate' do Django para verificar a senha
        # e o status 'is_active' do usuário.
        # 'authenticate' requer o USERNAME_FIELD, que ainda é 'username'.
        user_auth = authenticate(
            username=user.username,
            password=password
        )

        if not user_auth:
            # Senha incorreta ou usuário inativo
            raise serializers.ValidationError('Credenciais inválidas.')

        # Se a autenticação foi bem-sucedida, 'self.user' é setado
        self.user = user_auth

        # A lógica original do 'simplejwt' para gerar os tokens
        # é chamada aqui, mas precisamos fazer manualmente pois
        # não chamamos o super().validate()
        data = {}
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # (Opcional) Adiciona dados extras do usuário na resposta do login
        data['user'] = {
            'user_id': self.user.user_id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'access_level': self.user.get_access_level_display(), # 'get...display()' é melhor
        }

        return data
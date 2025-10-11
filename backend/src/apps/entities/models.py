from django.db import models

class Ecoponto(models.Model):
    id_ecoponto = models.CharField(primary_key=True, max_length=100) # PK de Ecoponto
    id_usuario  = models.ForeignKey( # FK que referencia um Usuario representante do Ecoponto
        'Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='ID_USUARIO',
        related_name='usuario_representante'
    )
    nome = models.CharField(max_length=100, unique=True) # Nome do Ecoponto
    cnpj = models.CharField(max_length=20, unique=True) 
    cep  = models.CharField(max_length=10)

    class Meta:
        db_table = 'ECOPONTO'
        verbose_name = 'Ecoponto'
        verbose_name_plural = 'Ecopontos'
    
    def __str__(self):
        return self.id_ecoponto

class Usuario(models.Model):
    id_usuario = models.CharField(primary_key=True, max_length=100) # PK de Usuario
    id_ecoponto_fav = models.ForeignKey( # FK que referencia um Ecoponto como favorito do Usuario
        Ecoponto,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='ID_ECOPONTO_FAV',
        related_name='ecopontos_favoritos'
    )

    nome  = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    cpf   = models.CharField(max_length=14, unique=True)
    cep   = models.CharField(max_length=10)
    
    # Niveis de acesso à plataforma
    NIVEIS = [
        ('U', 'Usuario Comum'), # Apenas registra reciclagens, acumula pontos, resgata cupons e participa do blog
        ('A', 'Administrador'), # Adiciona cupons e faz posts ao blog
        ('G', 'Gerente Ecoponto') # Registra reciclagens para o Ecoponto
    ]

    nivel_de_acesso = models.CharField(max_length=1,
                                        choices=NIVEIS,
                                        default='C',
                                        db_column='NIVEL_DE_ACESSO'
    )

    class Meta:
        db_table = 'USUARIO'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return self.nome
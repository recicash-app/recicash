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


class Senha(models.Model):
    id_usuario = models.ForeignKey(
        Usuario,
        primary_key=True,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_USUARIO',
        related_name='usuario'
    )
    senha = models.CharField(max_length=30)

    class Meta:
        db_table = 'SENHA'
        verbose_name = 'Senha do usuario'
        verbose_name_plural = 'Senhas dos usuarios'


class Carteira(models.Model):
    id_usuario = models.ForeignKey(
        Usuario,
        primary_key=True,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_USUARIO',
        related_name='usuario'
    )
    pontos = models.IntegerField()

    class Meta:
        db_table = 'CARTEIRA'
        verbose_name = 'Carteira do usuario'
        verbose_name_plural = 'Carteiras dos usuarios'
    
    def __str__(self):
        return self.id_usuario


class ValorReciclagem(models.Model):
    id_valor_reciclagem = models.CharField(primary_key=True, max_length=100)
    valor_pontos = models.FloatField()
    data = models.DateTimeField()

    class Meta:
        db_table = 'VALOR_RECICLAGEM'
        verbose_name = 'Valor da Reciclagem'
        verbose_name_plural = 'Valores da Reciclagem'
    
    def __str__(self):
        return self.id_valor_reciclagem
    

class Reciclagem(models.Model):
    id_reciclagem = models.CharField(primary_key=True, max_length=100)
    id_usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_USUARIO',
        related_name='usuario'
    )
    id_ecoponto = models.ForeignKey(
        Ecoponto,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_ECOPONTO',
        related_name='ecoponto'
    )
    id_valor_reciclagem = models.ForeignKey(
        ValorReciclagem,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_VALOR_RECICLAGEM',
        related_name='valor da reciclagem'
    )
    valor_pontos = models.IntegerField(max_length=100)
    peso = models.FloatField(max_length=300)
    data = models.DateTimeField()
    hash_validacao = models.CharField()

    class Meta:
        db_table = 'RECICLAGEM'
        verbose_name = 'reciclagem'
        verbose_name_plural = 'reciclagens'
    
    def __str__(self):
        return self.id_reciclagem


class EmpresaParceira(models.Model):
    id_empresa = models.CharField(primary_key=True, max_length=100)
    cnpj = models.CharField(unique=True, max_length=20)
    nome = models.CharField(max_length=255)

    class Meta:
        db_table = 'EMPRESA_PARCEIRA'
        verbose_name = 'empresa parceira'
        verbose_name_plural = 'empresas parceiras'
    
    def __str__(self):
        return self.cnpj
    

class Cupom(models.Model):
    id_cupom = models.CharField(primary_key=True, max_length=100)
    id_empresa_parceira = models.ForeignKey(
        EmpresaParceira,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_EMPRESA_PARCEIRA',
        related_name='empresa parceira'
    )

    TIPOS_DE_CUPOM = [
        ('DESCONTO_PORCENTAGEM', 'Porcentagem de Desconto'),
        ('DESCONTO_DIRETO', 'Desconto em dinheiro'),
        ('BRINDE', 'Brinde')
    ]

    tipo_de_cupom = models.CharField(choices=TIPOS_DE_CUPOM,
                                     default='DESCONTO_PORCENTAGEM',
                                     db_column='TIPO_DE_CUPOM'
                                )
    
    valor = models.IntegerField()
    custo_pontos = models.IntegerField(max_length=100)
    hash_validacao = models.CharField()
    data_inicio = models.DateTimeField()
    data_validade = models.DateTimeField()

    class Meta:
        db_table = 'CUPOM'
        verbose_name = 'cupom'
        verbose_name_plural = 'cupons'



class TransacoesCupom(models.Model):
    id_transacao = models.CharField(primary_key=True, max_length=100)
    id_usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_USUARIO',
        related_name='usuario'
    )
    id_cupom = models.ForeignKey(
        Cupom,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_USUARIO',
        related_name='usuario'
    )
    valor_pontos = models.IntegerField(max_length=100)
    data = models.DateTimeField()

    class Meta:
        db_table = 'TRANSACOES_CUPOM'
        verbose_name = 'transação de cupom'
        verbose_name_plural = 'transações de cupons'


class PostBlog(models.Model):
    id_post = models.CharField(max_length=100)
    id_autor = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=False,
        blank=False,
        db_column='ID_AUTOR',
        related_name='usuario autor do post'
    )
    titulo = models.CharField()
    texto = models.CharField()
    imagens = models.CharField()
    data_criacao = models.DateTimeField(editable=False)
    data_ultima_edicao = models.DateTimeField()

    class Meta:
        db_table = 'POST_BLOG'
        verbose_name = 'post'
        verbose_name_plural = 'posts'

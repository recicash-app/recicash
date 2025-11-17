from django.db import models
from django.contrib.auth.models import AbstractUser

"""
Model definitions for the entities app.

Contains:
- User, RecyclingPoint, PostBlog, PostImage, etc.

Notes:
- PostBlog.author_id must be a User instance (see PostBlogViewSet.perform_create).
- PostImage.image stored under MEDIA_ROOT/blog_images/.
"""

class RecyclingPoint(models.Model):
    recycling_point_id = models.BigAutoField(primary_key=True) # PK de Ecoponto
    user_id  = models.ForeignKey( # FK that references to a Recycling Point representative User
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='USER_ID',
        related_name='representative_user'
    )
    name = models.CharField(max_length=100, unique=True)
    cnpj = models.CharField(max_length=20, unique=True) 
    zip_code  = models.CharField(max_length=10)
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        db_table = 'RECYCLING_POINT'
        verbose_name = 'Recycling point'
        verbose_name_plural = 'Recycling points'
    
    def __str__(self):
        return self.recycling_point_id


class User(AbstractUser):
    user_id = models.BigAutoField(primary_key=True) # PK de Usuario
    fav_recycling_point_id = models.ForeignKey( # FK that references to favorite Recycling Point 
        RecyclingPoint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='FAV_RECYCLING_POINT_ID',
        related_name='favorite_recycling_point'
    )

    username = models.CharField(max_length=150, default='defaultusername', unique=True)
    password = models.CharField(max_length=128, default='defaultpassword')

    cpf = models.CharField(max_length=14, unique=True)
    zip_code = models.CharField(max_length=10)
    
    # Platform access levels
    ACCESS_LEVELS = [
        ('U', 'Regular User'), # Only register recyclings and accumulate points 
        ('A', 'Administrator'), # Add coupons and create posts
        ('M', 'Recycling Point Manager') # Register recycling for a recycling point
    ]

    access_level = models.CharField(max_length=1,
                                        choices=ACCESS_LEVELS,
                                        default='U',
                                        db_column='ACCESS_LEVEL'
    )

    class Meta:
        db_table = 'USER'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email
        return self.email


class Password(models.Model):
    user_id = models.OneToOneField(
        User,
        primary_key=True,
        on_delete=models.CASCADE,
        db_column='USER_ID',
        related_name='user_password'
    )
    password = models.CharField(max_length=30)

    class Meta:
        db_table = 'PASSWORD'
        verbose_name = 'User password'
        verbose_name_plural = 'User passwords'


class Wallet(models.Model):
    user_id = models.OneToOneField(
        User,
        primary_key=True,
        on_delete=models.CASCADE,
        db_column='USER_ID',
        related_name='WALLET_USER'
    )
    points_balance = models.IntegerField()

    class Meta:
        db_table = 'WALLET'
        verbose_name = 'User wallet'
        verbose_name_plural = 'Users wallet'
    
    def __str__(self):
        return self.user_id
    

class WalletHistory(models.Model):
    history_id = models.BigAutoField(primary_key=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='USER_ID',
        related_name='WALLET_HISTORY_USER'
    )

    # Platform access levels
    OPERATION = [
        ('RECYCLING', 'Recycling'), 
        ('COUPON_TRANSACTION', 'Bought coupon'), 
        ('EARN_POINTS', 'Earned points') 
    ]

    operation = models.CharField(max_length=255,
                                choices=OPERATION,
                                default='RECYCLING',
                                db_column='operation'
                            )

    value = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'WALLET_HISTORY'
        verbose_name = 'Wallet history'
        verbose_name_plural = 'Wallet history'
    
    def __str__(self):
        return self.history_id


class RecyclingValue(models.Model):
    recycling_value_id = models.BigAutoField(primary_key=True)
    points_value = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'RECYCLING_VALUE'
        verbose_name = 'Recycling value'
        verbose_name_plural = 'Recycling values'
    
    def __str__(self):
        return self.id_valor_reciclagem
    

class Recycling(models.Model):
    recycling_id = models.BigAutoField(primary_key=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        db_column='user_id',
        related_name='user_recycling'
    )
    recycling_point_id = models.ForeignKey(
        RecyclingPoint,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        db_column='RECYCLING_POINT_ID',
        related_name='recycling_point'
    )
    recycling_value_id = models.ForeignKey(
        RecyclingValue,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        db_column='RECYCLING_VALUE_ID',
        related_name='recycling_value'
    )
    points_value = models.IntegerField()
    weight = models.FloatField(max_length=300)
    date = models.DateTimeField(auto_now_add=True)
    validation_hash = models.CharField(max_length=255)

    class Meta:
        db_table = 'RECYCLING'
        verbose_name = 'Recycling'
        verbose_name_plural = 'Recyclings'
    
    def __str__(self):
        return self.id_reciclagem


class PartnerCompany(models.Model):
    company_id = models.BigAutoField(primary_key=True)
    cnpj = models.CharField(unique=True, max_length=20)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'PARTNER_COMPANY'
        verbose_name = 'Partner company'
        verbose_name_plural = 'Partner companies'
    
    def __str__(self):
        return self.cnpj
    

class Coupon(models.Model):
    coupon_id = models.BigAutoField(primary_key=True)
    partner_company_id = models.ForeignKey(
        PartnerCompany,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        db_column='PARTNER_COMPANY_ID',
        related_name='partner_company'
    )

    COUPON_TYPES = [
        ('PERCENTAGE_DISCOUNT', 'Discount Percentage'),
        ('DIRECT_DISCOUNT', 'Discount in Cash'),
        ('GIFT', 'Gift')
    ]

    coupon_type = models.CharField(max_length=255,
                                     choices=COUPON_TYPES,
                                     default='PERCENTAGE_DISCOUNT',
                                     db_column='COUPON_TYPE'
                                )
    
    value = models.IntegerField()
    points_cost = models.IntegerField()
    validation_hash = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    expiring_date = models.DateTimeField()

    class Meta:
        db_table = 'COUPON'
        verbose_name = 'coupon'
        verbose_name_plural = 'coupons'


class CouponsTransactions(models.Model):
    transaction_id = models.BigAutoField(primary_key=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        db_column='user_id',
        related_name='user_coupon_transation'
    )
    coupon_id = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        db_column='COUPON_ID',
        related_name='user_coupon'
    )
    points_value = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'COUPONS_TRANSACTIONS'
        verbose_name = 'coupon transaction'
        verbose_name_plural = 'coupon transactions'


class PostBlog(models.Model):
    post_id = models.BigAutoField(primary_key=True)
    author_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        db_column='AUTHOR_ID',
        related_name='author_user'
    )
    title = models.CharField(max_length=200)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    last_edition_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'POST_BLOG'
        verbose_name = 'post'
        verbose_name_plural = 'posts'


class PostImage(models.Model):
    post = models.ForeignKey(
        PostBlog,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(upload_to='blog_images/')

    class Meta:
        db_table = 'POST_IMAGE'
        verbose_name = 'post_image'
        verbose_name_plural = 'post_images'

    def __str__(self):
        return f"Post image: {self.post.title}"
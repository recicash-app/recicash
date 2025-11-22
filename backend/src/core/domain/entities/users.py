from django.db import models
from django.contrib.auth.models import AbstractUser

class RecyclingPoint(models.Model):
    """
    Represents a recycling point (ecoponto).
    References a representative User (optional).
    """
    recycling_point_id = models.BigAutoField(primary_key=True)
    user_id = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='USER_ID',
        related_name='representative_user'
    )

    name = models.CharField(max_length=100, unique=True)
    cnpj = models.CharField(max_length=20, unique=True)
    zip_code = models.CharField(max_length=10)
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        db_table = 'RECYCLING_POINT'
        verbose_name = 'Recycling point'
        verbose_name_plural = 'Recycling points'

    def __str__(self):
        return f"RecyclingPoint {self.recycling_point_id} - {self.name}"


class User(AbstractUser):
    """
    Custom platform user model.
    Supports three access levels: U, A, M.
    """

    user_id = models.BigAutoField(primary_key=True)

    fav_recycling_point_id = models.ForeignKey(
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

    access_level = models.CharField(
        max_length=1,
        choices=ACCESS_LEVELS,
        default='U',
        db_column='ACCESS_LEVEL'
    )

    class Meta:
        db_table = 'USER'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.email or self.username}"
    

class Wallet(models.Model):
    """
    Wallet containing point balance for each user.
    """

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
        return f"Wallet of {self.user_id}"
    

class WalletHistory(models.Model):
    """
    Log of all wallet operations.
    """
    history_id = models.BigAutoField(primary_key=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='USER_ID',
        related_name='WALLET_HISTORY_USER'
    )

    OPERATION = [
        ('RECYCLING', 'Recycling'),
        ('COUPON_TRANSACTION', 'Bought coupon'),
        ('EARN_POINTS', 'Earned points')
    ]

    operation = models.CharField(
        max_length=255,
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
        return f"History {self.history_id} - {self.operation}"

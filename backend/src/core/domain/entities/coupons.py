from django.db import models
from .users import User


class PartnerCompany(models.Model):
    """
    A partner company that offers coupons.
    """
    company_id = models.BigAutoField(primary_key=True)
    cnpj = models.CharField(unique=True, max_length=20)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'PARTNER_COMPANY'
        verbose_name = 'Partner company'
        verbose_name_plural = 'Partner companies'

    def __str__(self):
        return f"{self.name} ({self.cnpj})"
    

class Coupon(models.Model):
    """
    Coupon offered by a partner company.
    """
    coupon_id = models.BigAutoField(primary_key=True)

    partner_company_id = models.ForeignKey(
        PartnerCompany,
        on_delete=models.SET_NULL,
        null=True,
        db_column='PARTNER_COMPANY_ID',
        related_name='partner_company'
    )

    COUPON_TYPES = [
        ('PERCENTAGE_DISCOUNT', 'Discount Percentage'),
        ('DIRECT_DISCOUNT', 'Discount in Cash'),
        ('GIFT', 'Gift')
    ]

    coupon_type = models.CharField(
        max_length=255,
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

    def __str__(self):
        return f"Coupon {self.coupon_id} ({self.coupon_type})"
    

class CouponsTransactions(models.Model):
    """
    Records when a user buys/redeems a coupon.
    """
    transaction_id = models.BigAutoField(primary_key=True)

    user_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        db_column='user_id',
        related_name='user_coupon_transaction'
    )

    coupon_id = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        db_column='COUPON_ID',
        related_name='user_coupon'
    )

    points_value = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'COUPONS_TRANSACTIONS'
        verbose_name = 'coupon transaction'
        verbose_name_plural = 'coupon transactions'

    def __str__(self):
        return f"Transaction {self.transaction_id}"
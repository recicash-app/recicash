from django.db import models
from .users import User, RecyclingPoint

class RecyclingValue(models.Model):
    """
    Defines the amount of points a recycling action is worth.
    """
    recycling_value_id = models.BigAutoField(primary_key=True)
    points_value = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'RECYCLING_VALUE'
        verbose_name = 'Recycling value'
        verbose_name_plural = 'Recycling values'

    def __str__(self):
        return f"RecyclingValue {self.recycling_value_id}"
    

class Recycling(models.Model):
    """
    Records a recycling action by a user at a recycling point.
    """
    recycling_id = models.BigAutoField(primary_key=True)

    user_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        db_column='user_id',
        related_name='user_recycling'
    )

    recycling_point_id = models.ForeignKey(
        RecyclingPoint,
        on_delete=models.SET_NULL,
        null=True,
        db_column='RECYCLING_POINT_ID',
        related_name='recycling_point'
    )

    recycling_value_id = models.ForeignKey(
        RecyclingValue,
        on_delete=models.SET_NULL,
        null=True,
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
        return f"Recycling {self.recycling_id}"

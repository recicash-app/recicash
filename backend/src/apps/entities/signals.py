from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import PostImage

@receiver(post_delete, sender=PostImage)
def delete_image_file(sender, instance, **kwargs):
    """
    Remove the image file from storage when a PostImage instance is deleted.
    The file is deleted from the storage backend; the model instance is not saved.
    """
    if instance.image:
        instance.image.delete(save=False)
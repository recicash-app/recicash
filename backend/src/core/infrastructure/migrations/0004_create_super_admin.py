from django.db import migrations
import os  

def create_super_admin(apps, schema_editor):  
    User = apps.get_model('domain', 'User')  

    # Fetch credentials from environment variables, with insecure defaults for development only  
    super_admin_email = os.environ.get("SUPER_ADMIN_EMAIL", "admin@admin.com")  
    super_admin_password = os.environ.get("SUPER_ADMIN_PASSWORD", "admin123")  

    if not User.objects.filter(email=super_admin_email).exists():  
        User.objects.create_superuser(  
            email=super_admin_email,  
            username="superadmin",  
            password=super_admin_password,  
            access_level="A"  
        )  

def delete_super_admin(apps, schema_editor):  
    User = apps.get_model('domain', 'User')  
    # Use the same environment variable for email to delete the correct user  
    super_admin_email = os.environ.get("SUPER_ADMIN_EMAIL", "admin@admin.com")
    User.objects.filter(email=super_admin_email).delete()  

def create_super_admin(apps, schema_editor):
    User = apps.get_model('domain', 'User')

    if not User.objects.filter(email="admin@admin.com").exists():
        User.objects.create_superuser(
            email="admin@admin.com",
            username="superadmin",
            password="admin123",
            access_level="A"
        )

def delete_super_admin(apps, schema_editor):
    User = apps.get_model('domain', 'User')
    User.objects.filter(email="admin@admin.com").delete()

class Migration(migrations.Migration):

    dependencies = [
        ('domain', '0003_recyclingpoint_maps_id'),
    ]

    operations = [
        migrations.RunPython(create_super_admin, delete_super_admin),
    ]

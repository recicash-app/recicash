from django.db import migrations

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
        ('domain', '0002_enable_pg_trgm'),
    ]

    operations = [
        migrations.RunPython(create_super_admin, delete_super_admin),
    ]

from django.test import TestCase
from django.core.management import call_command
from django.contrib.auth import get_user_model

class CleanDBPerClassTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command('flush', verbosity=0, interactive=False)
        
        User = get_user_model()
        if not User.objects.filter(email='admin@admin.com').exists():
            User.objects.create_superuser(
                email='admin@admin.com',
                username='superadmin',
                password='admin123',
                access_level='A',
                cpf="00000000001"
            )
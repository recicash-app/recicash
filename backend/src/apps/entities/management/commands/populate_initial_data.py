from django.core.management.base import BaseCommand
from apps.entities.models import User, Wallet, Password
import logging

# Logging basic configuration
logger = logging.getLogger(__name__)

def create_data():
    logger.info("Starting initial data creation")
    try:
        user, created = User.objects.get_or_create(
            user_id='user_001',
            defaults={
                'name': 'Jose Alves',
                'email': 'jose@recicash.com',
                'cpf': '123.456.789-00',
                'zip_code': '01001-000',
                'access_level': 'U'
            }
        )
        if created:
            logger.info(f"User '{user.nome}' created.")
        
    except Exception as e:
        logger.error(f"Error creating User: {e}")
        return
    
    try:
        Wallet.objects.get_or_create(
            user_id=user,
            defaults={'pontos': 500}
        )
        Password.objects.get_or_create(
            user_id=user,
            # Still in production.
            # Passwords must be stored in hashes
            defaults={'password': 'safe_hash_password'}
        )
        logger.info("Wallet and Password created for user")
    
    except Exception as e:
        logger.error(f"Error creating Wallet/Password: {e}")

    logger.info("Initial data created successfully!")


class Command(BaseCommand):
    help = 'Populates the database with initial, necessary data for the application to run.'

    def handle(self, *args, **options):
        create_data()
        self.stdout.write(self.style.SUCCESS('Population command executed successfully!'))
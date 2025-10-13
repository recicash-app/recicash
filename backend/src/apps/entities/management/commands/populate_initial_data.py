from django.core.management.base import BaseCommand
from apps.entities.models import Usuario, Carteira, Senha
import logging

# Logging basic configuration
logger = logging.getLogger(__name__)

def create_data():
    logger.info("Starting initial data creation")
    try:
        usuario, created = Usuario.objects.get_or_create(
            id_usuario='user_001',
            defaults={
                'nome': 'Jose Alves',
                'email': 'jose@recicash.com',
                'cpf': '123.456.789-00',
                'cep': '01001-000',
                'nivel_de_acesso': 'U'
            }
        )
        if created:
            logger.info(f"User '{usuario.nome}' created.")
        
    except Exception as e:
        logger.error(f"Error creating User: {e}")
        return
    
    try:
        Carteira.objects.get_or_create(
            id_usuario=usuario,
            defaults={'pontos': 500}
        )
        Senha.objects.get_or_create(
            id_usuario=usuario,
            # Still in production.
            # Passwords must be stored in hashes
            defaults={'senha': 'senha_hash_segura'}
        )
        logger.info("Carteira and Senha created for user")
    
    except Exception as e:
        logger.error(f"Error creating Carteira/Senha: {e}")

    logger.info("Initial data created successfully!")


class Command(BaseCommand):
    help = 'Populates the database with initial, necessary data for the application to run.'

    def handle(self, *args, **options):
        create_data()
        self.stdout.write(self.style.SUCCESS('Population command executed successfully!'))
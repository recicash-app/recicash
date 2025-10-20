import logging
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.apps import apps

# Configure logger
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    """
    A Django management command to wipe all data from the PostgreSQL database.
    It truncates all tables, resetting them to an empty state.
    """
    help = 'Deletes ALL data from the PostgreSQL database, truncating all tables.'

    def add_arguments(self, parser):
        """
        Adds a command-line argument to bypass the confirmation prompt.
        """
        parser.add_argument(
            '--no-input',
            action='store_true',
            help='Skips the confirmation prompt. USE WITH CAUTION!',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        The main logic of the command.
        """
        db_engine = connection.settings_dict['ENGINE']

        if not options['no_input']:
            confirmation = input(
                self.style.WARNING(
                    "You are about to DELETE ALL DATA from your database. "
                    "This action is irreversible.\n"
                    "Are you sure you want to continue? (yes/no): "
                )
            )
            if confirmation.lower() != 'yes':
                self.stdout.write(self.style.NOTICE("Operation cancelled."))
                return

        self.stdout.write(self.style.WARNING("Starting database wipe..."))

        try:
            with connection.cursor() as cursor:
                # Get all models registered in the Django project
                all_models = apps.get_models(include_auto_created=True)
                
                # Filter out tables that are not managed by Django or special cases
                table_names = [
                    model._meta.db_table
                    for model in all_models
                    if hasattr(model._meta, 'db_table')
                ]
                
                # Ensure we have tables to truncate
                if not table_names:
                    self.stdout.write(self.style.NOTICE("No tables found to truncate."))
                    return

                # Using TRUNCATE ... RESTART IDENTITY CASCADE is the most efficient way
                # to wipe data and reset sequences in PostgreSQL.
                self.stdout.write(f"Truncating {len(table_names)} tables...")
                
                # The tables must be quoted to handle special characters or case sensitivity
                quoted_tables = [f'"{table}"' for table in table_names]
                
                sql_command = f"TRUNCATE TABLE {', '.join(quoted_tables)} RESTART IDENTITY CASCADE;"
                
                cursor.execute(sql_command)

                self.stdout.write(self.style.SUCCESS(
                    "Successfully wiped the database. All tables are empty and sequences are reset."
                ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
            self.stdout.write(self.style.ERROR("Database wipe failed."))
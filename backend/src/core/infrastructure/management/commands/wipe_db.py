import logging
from django.core.management.base import BaseCommand
from django.db import connection, transaction

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Deletes ALL data from the PostgreSQL database, truncating all tables.'

    def add_arguments(self, parser):
        parser.add_argument('--no-input', action='store_true', help='Skips the confirmation prompt. USE WITH CAUTION!')

    @transaction.atomic
    def handle(self, *args, **options):
        if not options.get('no_input', False):
            confirmation = input(self.style.WARNING(
                "You are about to DELETE ALL DATA from your database. This action is irreversible.\n"
                "Are you sure you want to continue? (yes/no): "
            ))
            if confirmation.lower() != 'yes':
                self.stdout.write(self.style.WARNING("Aborted."))
                return

        self.stdout.write(self.style.WARNING("Starting database wipe..."))

        try:
            with connection.cursor() as cursor:
                table_infos = connection.introspection.get_table_list(cursor)
                tables = []
                for ti in table_infos:
                    # TableInfo has .name and .type on modern Django
                    name = getattr(ti, "name", None) or (ti[0] if isinstance(ti, (list, tuple)) else None)
                    ttype = getattr(ti, "type", None)
                    # keep only real tables (type 't' or 'table'); skip views and PostGIS helper objects
                    if ttype and str(ttype).lower() not in ("t", "table"):
                        continue
                    if name in ("spatial_ref_sys", "geometry_columns", "geography_columns"):
                        continue
                    # skip django_migrations? keep if you want clean start but if you want to preserve migration history remove from list
                    if name is None:
                        continue
                    tables.append(name)

                if not tables:
                    self.stdout.write(self.style.WARNING("No tables to truncate."))
                    return

                quoted = ", ".join(f'"{t}"' for t in tables)
                cursor.execute(f'TRUNCATE TABLE {quoted} RESTART IDENTITY CASCADE;')
            self.stdout.write(self.style.SUCCESS(f"Truncated {len(tables)} tables."))
        except Exception as e:
            logger.exception("Database wipe failed")
            self.stdout.write(self.style.ERROR(f"Database wipe failed: {e}"))
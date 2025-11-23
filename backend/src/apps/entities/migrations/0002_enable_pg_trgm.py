"""
Migration to enable PostgreSQL pg_trgm extension for text search.

This extension provides trigram similarity functions that improve
text search capabilities, especially for handling typos and accents.
"""

from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('entities', '0001_initial'),
    ]

    operations = [
        TrigramExtension(),
    ]
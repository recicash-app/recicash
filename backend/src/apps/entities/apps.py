from django.apps import AppConfig

class EntitiesConfig(AppConfig):
    # App name, used internally
    name = 'apps.entities' 
    verbose_name = "Data Entity"

    def ready(self):
        import apps.entities.signals
from django.apps import AppConfig

class EntitiesConfig(AppConfig):
    # App name, used internally
    name = 'core.domain'
    label = 'domain'
    verbose_name = "Data Entity"

    def ready(self):
        import core.infrastructure.signals

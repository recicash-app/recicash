from core.domain.models import Message

class HealthCheckService:
    @staticmethod
    def status() -> Message:
        return Message("Backend Recicash funcionando!")
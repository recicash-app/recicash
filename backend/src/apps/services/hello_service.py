from apps.entities.message import Message

class HelloService:
    @staticmethod
    def get_message() -> Message:
        return Message("Backend Recicash funcionando!")

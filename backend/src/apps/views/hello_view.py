from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.services.hello_service import HelloService


class HelloView(APIView):
    def get(self, request):
        message = HelloService.get_message()
        return Response({"message": message.text}, status=status.HTTP_200_OK)

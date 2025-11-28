from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.application.use_cases import HealthCheckService

class HelloViewSet(APIView):
    def get(self, request):
        message = HealthCheckService.status()
        return Response({"message": message.text}, status=status.HTTP_200_OK)

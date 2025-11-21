"""
Views for RecyclingPoint endpoints.

Includes:
- List all recycling points
- Retrieve a specific recycling point
- Get location of a specific recycling point
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser

from apps.entities.models import RecyclingPoint
from apps.entities.serializers import RecyclingPointSerializer
from apps.services.google_maps_service import GoogleMapsService

import logging

logger = logging.getLogger(__name__)


class RecyclingPointViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoints for RecyclingPoint locations.
    
    Supported endpoints (mounted under router, e.g. /api/v1/recycling-points/):
    - GET /                        -> list all recycling points
    - GET /{id}/                   -> retrieve a specific recycling point
    - GET /{id}/location/          -> get location of a specific recycling point
    
    All endpoints are publicly accessible (AllowAny).
    """
    
    queryset = RecyclingPoint.objects.all().order_by('name')
    serializer_class = RecyclingPointSerializer
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.maps_service = GoogleMapsService()
    
    @action(detail=True, methods=['get'], url_path='location')
    def get_location(self, request, pk=None):
        """
        Get the exact location of a specific recycling point.
        
        Includes a direct Google Maps link with the recycling point name displayed.
        
        Example:
            GET /api/v1/recycling-points/{id}/location/
            
        Response:
        {
            "recycling_point_id": 1,
            "name": "Ecoponto Centro",
            "latitude": -15.7942,
            "longitude": -48.0766,
            "cnpj": "12.345.678/0001-90",
            "zip_code": "70000-000",
            "maps_url": "https://www.google.com/maps?q=-15.7942,-48.0766&q=Ecoponto Centro"
        }
        """
        try:
            point = self.get_object()
            result = self.maps_service.get_recycling_point_details(point.recycling_point_id)
            
            if result is None:
                return Response(
                    {'error': 'RecyclingPoint not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(result)
            
        except Exception as e:
            logger.error(f"Error in get_location: {str(e)}")
            return Response(
                {'error': 'An error occurred while retrieving location'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

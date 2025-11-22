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
            "maps_url": "https://www.google.com/maps?q=-15.7942,-48.0766&q=Ecoponto%20Centro"
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
    
    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby(self, request):
        """
        Search for nearby recycling points registered in the database.
        
        Query Parameters:
        - lat (required): User's latitude (float)
        - lon (required): User's longitude (float)
        - radius (optional): Search radius in meters (default: 5000, max: 50000)
        
        Example:
            GET /api/v1/recycling-points/nearby/?lat=-15.7942&lon=-48.0766&radius=10000
            
        Response:
        [
            {
                "recycling_point_id": "rp_001",
                "name": "Ecoponto Centro",
                "latitude": -15.7938,
                "longitude": -48.0750,
                "cnpj": "12.345.678/0001-90",
                "zip_code": "70000-000",
                "address": "Rua X, Brasília - DF",
                "distance_meters": 125.5,
                "maps_url": "https://www.google.com/maps?q=-15.7938,-48.0750&q=Ecoponto%20Centro"
            },
            ...
        ]
        """
        try:
            logger.info(f"nearby request received with params: {dict(request.query_params)}")
            
            # Get and validate latitude
            lat = request.query_params.get('lat')
            if not lat:
                logger.warning("Missing required parameter: lat")
                return Response(
                    {'error': 'Missing required parameter: lat'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get and validate longitude
            lon = request.query_params.get('lon')
            if not lon:
                logger.warning("Missing required parameter: lon")
                return Response(
                    {'error': 'Missing required parameter: lon'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                latitude = float(lat)
                longitude = float(lon)
            except ValueError:
                logger.warning(f"Invalid lat/lon values: lat={lat}, lon={lon}")
                return Response(
                    {'error': 'Parameters lat and lon must be valid floats'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate coordinate ranges
            if not (-90 <= latitude <= 90):
                return Response(
                    {'error': 'Latitude must be between -90 and 90'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not (-180 <= longitude <= 180):
                return Response(
                    {'error': 'Longitude must be between -180 and 180'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get optional radius (default 5000 meters = 5km)
            try:
                radius = int(request.query_params.get('radius', 5000))
            except ValueError:
                logger.warning(f"Invalid radius value: {request.query_params.get('radius')}")
                return Response(
                    {'error': 'Parameter radius must be a valid integer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Enforce maximum radius of 50km
            if radius > 50000:
                radius = 50000
            
            logger.info(f"Searching nearby recycling points: lat={latitude}, lon={longitude}, radius={radius}")
            
            # Search for nearby recycling points in database
            points = self.maps_service.search_nearby_recycling_points(
                latitude=latitude,
                longitude=longitude,
                radius_meters=radius
            )
            
            logger.info(f"Found {len(points)} recycling points nearby")
            
            return Response(points)
            
        except Exception as e:
            logger.error(f"Error in nearby: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while searching for nearby recycling points'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='nearby-address')
    def nearby_address(self, request):
        """
        Search for nearby recycling points using an address string.
        
        Uses Google Geocoding API to convert address to coordinates,
        then searches for registered recycling points nearby.
        
        Query Parameters:
        - address (required): Address string (e.g., "Rua Augusta 1000, São Paulo, SP")
        - radius (optional): Search radius in meters (default: 5000, max: 50000)
        
        Example:
            GET /api/v1/recycling-points/nearby-address/?address=Rua+Augusta+1000,+São+Paulo,+SP&radius=10000
            
        Response:
        {
            "success": true,
            "address": "Rua Augusta 1000, São Paulo, SP",
            "geocoded_location": {
                "latitude": -23.5478,
                "longitude": -46.6521
            },
            "search_radius_meters": 10000,
            "total_found": 3,
            "recycling_points": [
                {
                    "recycling_point_id": "rp_001",
                    "name": "Ecoponto Centro",
                    "latitude": -23.5480,
                    "longitude": -46.6520,
                    "address": "Rua X, São Paulo - SP",
                    "distance_meters": 125.5,
                    "maps_url": "..."
                },
                ...
            ]
        }
        """
        try:
            logger.info(f"nearby_address request received with params: {dict(request.query_params)}")
            
            # Get and validate address
            address = request.query_params.get('address')
            if not address or not address.strip():
                logger.warning("Missing required parameter: address")
                return Response(
                    {'error': 'Missing required parameter: address'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get optional radius (default 5000 meters = 5km)
            try:
                radius = int(request.query_params.get('radius', 5000))
            except ValueError:
                logger.warning(f"Invalid radius value: {request.query_params.get('radius')}")
                return Response(
                    {'error': 'Parameter radius must be a valid integer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Enforce maximum radius of 50km
            if radius > 50000:
                radius = 50000
            
            logger.info(f"Geocoding and searching nearby: address={address}, radius={radius}")
            
            # Search using address
            result = self.maps_service.search_nearby_recycling_points_by_address(
                address=address,
                radius_meters=radius
            )
            
            logger.info(f"Found {result.get('total_found', 0)} recycling points for address: {address}")
            
            return Response(result)
            
        except Exception as e:
            logger.error(f"Error in nearby_address: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while searching by address'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

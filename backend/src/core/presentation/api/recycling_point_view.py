"""
Views for RecyclingPoint endpoints.

Includes:
- List all recycling points
- Retrieve a specific recycling point
- Get location of a specific recycling point
- Search for nearby places using Google Places API
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser
from django.conf import settings

from apps.entities.models import RecyclingPoint
from apps.entities.serializers import RecyclingPointSerializer, GooglePlacesResultSerializer
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
    - GET /nearby-places/?lat=X&lon=Y -> search for nearby places using Google Places API
    
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
    
    @action(detail=False, methods=['get'], url_path='nearby-places')
    def nearby_places(self, request):
        """
        Search for nearby places using Google Places API.
        
        Query Parameters:
        - lat (required): User's latitude (float)
        - lon (required): User's longitude (float)
        - keyword (optional): Search keyword (default: 'recycling')
        - radius (optional): Search radius in meters (default: 5000, max: 50000)
        
        Example:
            GET /api/v1/recycling-points/nearby-places/?lat=-15.7942&lon=-48.0766&keyword=recycling&radius=10000
            
        Response:
        [
            {
                "place_id": "ChIJ...",
                "name": "Ecoponto ABC",
                "latitude": -15.7938,
                "longitude": -48.0750,
                "address": "Rua X, Brasília - DF",
                "rating": 4.5,
                "user_ratings_total": 120,
                "open_now": true,
                "types": ["point_of_interest", "establishment"],
                "source": "google_places"
            },
            ...
        ]
        """
        try:
            logger.info(f"nearby_places request received with params: {dict(request.query_params)}")
            
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
            
            # Get optional keyword (default 'recycling')
            keyword = request.query_params.get('keyword', 'recycling')
            
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
            
            logger.info(f"Calling search_nearby_places with: lat={latitude}, lon={longitude}, keyword={keyword}, radius={radius}")
            
            # Search for nearby places
            places = self.maps_service.search_nearby_places(
                latitude=latitude,
                longitude=longitude,
                keyword=keyword,
                radius_meters=radius
            )
            
            logger.info(f"Got {len(places)} places from service")
            
            serializer = GooglePlacesResultSerializer(places, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in nearby_places: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while searching for nearby places'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='import-places')
    def import_places(self, request):
        """
        Import Google Places results and save them as RecyclingPoints.
        
        Takes the results from nearby-places and saves them to the database.
        
        Query Parameters:
        - lat (required): User's latitude (float)
        - lon (required): User's longitude (float)
        - keyword (optional): Search keyword (default: 'recycling')
        - radius (optional): Search radius in meters (default: 5000, max: 50000)
        
        Example:
            POST /api/v1/recycling-points/import-places/?lat=-15.7942&lon=-48.0766&keyword=recycling&radius=5000
            
        Response:
        {
            "created": 3,
            "existing": 1,
            "failed": 0,
            "total_processed": 4,
            "created_points": [
                {
                    "recycling_point_id": "ChIJ...",
                    "name": "Green Store",
                    "address": "Rua X, Brasília - DF",
                    "latitude": -15.7938,
                    "longitude": -48.0750
                },
                ...
            ]
        }
        """
        try:
            logger.info(f"import_places request received with params: {dict(request.query_params)}")
            
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
            
            # Get optional keyword (default 'recycling')
            keyword = request.query_params.get('keyword', 'recycling')
            
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
            
            logger.info(f"Searching nearby places: lat={latitude}, lon={longitude}, keyword={keyword}, radius={radius}")
            
            # Search for nearby places
            places = self.maps_service.search_nearby_places(
                latitude=latitude,
                longitude=longitude,
                keyword=keyword,
                radius_meters=radius
            )
            
            logger.info(f"Found {len(places)} places, saving to database")
            
            # Save places to database
            result = self.maps_service.save_places_as_recycling_points(places)
            
            logger.info(f"Import result: created={result['created']}, existing={result['existing']}, failed={result['failed']}")
            
            return Response(result)
            
        except Exception as e:
            logger.error(f"Error in import_places: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while importing places'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='api-status')
    def api_status(self, request):
        """
        Debug endpoint to check Google Maps API configuration and status.
        
        Example:
            GET /api/v1/recycling-points/api-status/
            
        Response:
        {
            "api_key_configured": true,
            "api_key_value": "AIza...",
            "service_initialized": true
        }
        """
        try:
            api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
            
            return Response({
                'api_key_configured': bool(api_key),
                'api_key_value': api_key[:10] + '...' if api_key else None,
                'service_initialized': self.maps_service is not None,
                'service_has_api_key': bool(self.maps_service.api_key) if self.maps_service else False
            })
        except Exception as e:
            logger.error(f"Error in api_status: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while checking API status'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

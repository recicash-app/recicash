"""
Service for integrating with Google Maps API.

Provides functionality to:
- Retrieve RecyclingPoint locations using Google Maps
- Search for nearby places using Google Places API
"""

import logging
import requests
from typing import Dict, Optional, List
from urllib.parse import quote
from django.conf import settings
from apps.entities.models import RecyclingPoint

logger = logging.getLogger(__name__)


class GoogleMapsService:
    """
    Service to interact with Google Maps API for RecyclingPoint locations.
    
    Requires the following settings to be configured:
    - GOOGLE_MAPS_API_KEY: Your Google Maps API key
    """
    
    PLACES_NEARBY_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"
    
    def __init__(self):
        """Initialize service with API key from settings."""
        self.api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
        if not self.api_key:
            logger.warning("GOOGLE_MAPS_API_KEY is not configured in settings")
    
    def get_recycling_point_details(self, recycling_point_id: int) -> Optional[Dict]:
        """
        Get detailed information about a specific RecyclingPoint.
        
        Args:
            recycling_point_id: ID of the RecyclingPoint
            
        Returns:
            Dictionary with RecyclingPoint details or None if not found
        """
        try:
            point = RecyclingPoint.objects.get(recycling_point_id=recycling_point_id)
            # URL encode the name to handle spaces and special characters
            encoded_name = quote(point.name)
            return {
                'recycling_point_id': point.recycling_point_id,
                'name': point.name,
                'latitude': point.latitude,
                'longitude': point.longitude,
                'cnpj': point.cnpj,
                'zip_code': point.zip_code,
                'maps_url': f"https://www.google.com/maps?q={point.latitude},{point.longitude}&q={encoded_name}"
            }
        except RecyclingPoint.DoesNotExist:
            logger.warning(f"RecyclingPoint with ID {recycling_point_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error retrieving RecyclingPoint details: {str(e)}")
            return None
    
    def search_nearby_places(
        self,
        latitude: float,
        longitude: float,
        keyword: str = 'recycling',
        radius_meters: int = 5000
    ) -> List[Dict]:
        """
        Search for places near given coordinates using Google Places API.
        
        Args:
            latitude: Center latitude
            longitude: Center longitude
            keyword: Search keyword (default: 'recycling')
            radius_meters: Search radius in meters (default 5000)
            
        Returns:
            List of places found near the coordinates
        """
        if not self.api_key:
            logger.error("Google Maps API key is not configured")
            return []
        
        try:
            params = {
                'location': f"{latitude},{longitude}",
                'radius': radius_meters,
                'keyword': keyword,
                'key': self.api_key
            }
            
            logger.info(f"Making Google Places API request for: lat={latitude}, lon={longitude}, keyword={keyword}, radius={radius_meters}")
            
            response = requests.get(self.PLACES_NEARBY_API_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Google Places API response status: {data.get('status')}")
            
            if data.get('status') != 'OK':
                logger.warning(f"Google Places search failed. Status: {data.get('status')}. Message: {data.get('error_message', 'No error message')}")
                return []
            
            places = []
            for result in data.get('results', []):
                try:
                    place = {
                        'place_id': result.get('place_id'),
                        'name': result.get('name'),
                        'latitude': result['geometry']['location']['lat'],
                        'longitude': result['geometry']['location']['lng'],
                        'address': result.get('vicinity', ''),
                        'rating': result.get('rating'),
                        'user_ratings_total': result.get('user_ratings_total'),
                        'open_now': result.get('opening_hours', {}).get('open_now'),
                        'types': result.get('types', []),
                        'source': 'google_places'
                    }
                    places.append(place)
                except (KeyError, TypeError) as e:
                    logger.warning(f"Error parsing place result: {str(e)}")
                    continue
            
            logger.info(f"Found {len(places)} places")
            return places
            
        except requests.exceptions.Timeout:
            logger.error("Timeout while searching Google Places")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching Google Places: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in search_nearby_places: {str(e)}")
            return []
    
    def get_zip_code_from_coordinates(
        self,
        latitude: float,
        longitude: float
    ) -> Optional[str]:
        """
        Get ZIP/postal code for coordinates using Reverse Geocoding API.
        
        Uses Google Geocoding API to convert coordinates back to address with postal code.
        
        Args:
            latitude: Geographic latitude
            longitude: Geographic longitude
            
        Returns:
            ZIP code string or None if not found
        """
        if not self.api_key:
            logger.error("Google Maps API key is not configured")
            return None
        
        try:
            params = {
                'latlng': f"{latitude},{longitude}",
                'key': self.api_key
            }
            
            response = requests.get(self.GEOCODING_API_URL, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            if data.get('status') != 'OK':
                logger.warning(f"Reverse geocoding failed. Status: {data.get('status')}")
                return None
            
            # Search for postal_code in address components
            if data.get('results'):
                for result in data['results']:
                    for component in result.get('address_components', []):
                        if 'postal_code' in component.get('types', []):
                            zip_code = component.get('long_name')
                            logger.info(f"Found ZIP code {zip_code} for coordinates {latitude}, {longitude}")
                            return zip_code
            
            logger.warning(f"No postal code found for coordinates: {latitude}, {longitude}")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error in reverse geocoding: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in get_zip_code_from_coordinates: {str(e)}")
            return None
    
    def save_places_as_recycling_points(
        self,
        places: List[Dict]
    ) -> Dict:
        """
        Save Google Places results as RecyclingPoints in the database.
        
        Saves only: place_id, name, address, latitude, longitude
        
        Args:
            places: List of place dictionaries from search_nearby_places()
            
        Returns:
            Dictionary with creation results
        """
        try:
            created_count = 0
            existing_count = 0
            failed_count = 0
            created_points = []
            
            for place in places:
                try:
                    place_id = place.get('place_id')
                    name = place.get('name')
                    latitude = place.get('latitude')
                    longitude = place.get('longitude')
                    address = place.get('address', '')
                    
                    # Validate required fields
                    if not all([place_id, name, latitude, longitude]):
                        logger.warning(f"Skipping place with missing fields: {place}")
                        failed_count += 1
                        continue
                    
                    # Check if already exists
                    existing = RecyclingPoint.objects.filter(
                        recycling_point_id=place_id
                    ).first()
                    
                    if existing:
                        logger.info(f"RecyclingPoint already exists: {name} (ID: {place_id})")
                        existing_count += 1
                        continue
                    
                    # Use default ZIP code
                    zip_code = '00000-000'
                    
                    # Create new RecyclingPoint
                    new_point = RecyclingPoint.objects.create(
                        recycling_point_id=place_id,
                        name=name,
                        address=address,
                        latitude=latitude,
                        longitude=longitude,
                        zip_code=zip_code,
                        cnpj=f"GOOGLE_{place_id[:8]}"
                    )
                    
                    created_count += 1
                    created_points.append({
                        'recycling_point_id': new_point.recycling_point_id,
                        'name': new_point.name,
                        'address': new_point.address,
                        'latitude': float(new_point.latitude),
                        'longitude': float(new_point.longitude),
                        'zip_code': new_point.zip_code
                    })
                    
                    logger.info(f"Created new RecyclingPoint: {name} (ID: {place_id}, ZIP: {zip_code})")
                    
                except Exception as e:
                    logger.error(f"Error creating RecyclingPoint from place: {str(e)}")
                    failed_count += 1
                    continue
            
            return {
                'created': created_count,
                'existing': existing_count,
                'failed': failed_count,
                'total_processed': len(places),
                'created_points': created_points
            }
            
        except Exception as e:
            logger.error(f"Error in save_places_as_recycling_points: {str(e)}")
            return {
                'created': 0,
                'existing': 0,
                'failed': len(places),
                'total_processed': len(places),
                'created_points': [],
                'error': str(e)
            }


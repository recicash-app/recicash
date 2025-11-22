"""
Service for integrating with Google Maps API.

Provides functionality to:
- Retrieve RecyclingPoint locations using Google Maps
- Search for nearby recycling points in the database
- Geocode addresses to coordinates using Google Geocoding API
"""

import logging
import math
import requests
from typing import Dict, Optional, List, Tuple
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
    
    def geocode_address(self, address: str) -> Optional[Tuple[float, float]]:
        """
        Convert an address string to latitude and longitude using Google Geocoding API.
        
        Args:
            address: Address string to geocode (e.g., "Rua Augusta, São Paulo, SP")
            
        Returns:
            Tuple of (latitude, longitude) or None if geocoding fails
        """
        if not self.api_key:
            logger.error("Google Maps API key is not configured")
            return None
        
        try:
            GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"
            
            params = {
                'address': address,
                'key': self.api_key
            }
            
            logger.info(f"Geocoding address: {address}")
            
            response = requests.get(GEOCODING_API_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'OK':
                logger.warning(f"Geocoding failed. Status: {data.get('status')}. Message: {data.get('error_message', 'No error message')}")
                return None
            
            if not data.get('results'):
                logger.warning(f"No results found for address: {address}")
                return None
            
            # Get the first result
            location = data['results'][0]['geometry']['location']
            latitude = location['lat']
            longitude = location['lng']
            
            logger.info(f"Geocoded address '{address}' to coordinates: ({latitude}, {longitude})")
            
            return (latitude, longitude)
            
        except requests.exceptions.Timeout:
            logger.error("Timeout while geocoding address")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error geocoding address: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in geocode_address: {str(e)}")
            return None
    
    def search_nearby_recycling_points(
        self,
        latitude: float,
        longitude: float,
        radius_meters: int = 5000
    ) -> List[Dict]:
        """
        Search for RecyclingPoints near given coordinates in the database.
        
        Calculates distance using Haversine formula for geographic coordinates.
        
        Args:
            latitude: Center latitude
            longitude: Center longitude
            radius_meters: Search radius in meters (default 5000)
            
        Returns:
            List of recycling points found, sorted by distance
        """
        try:
            # Earth radius in meters
            EARTH_RADIUS = 6371000
            
            # Get all recycling points
            all_points = RecyclingPoint.objects.all()
            
            nearby_points = []
            
            for point in all_points:
                # Haversine formula to calculate distance between two coordinates
                lat1 = math.radians(latitude)
                lat2 = math.radians(float(point.latitude))
                lon1 = math.radians(longitude)
                lon2 = math.radians(float(point.longitude))
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                
                a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
                c = 2 * math.asin(math.sqrt(a))
                distance = EARTH_RADIUS * c
                
                # Only include points within the radius
                if distance <= radius_meters:
                    encoded_name = quote(point.name)
                    nearby_points.append({
                        'recycling_point_id': point.recycling_point_id,
                        'name': point.name,
                        'latitude': float(point.latitude),
                        'longitude': float(point.longitude),
                        'cnpj': point.cnpj,
                        'zip_code': point.zip_code,
                        'address': point.address,
                        'distance_meters': round(distance, 2),
                        'maps_url': f"https://www.google.com/maps?q={point.latitude},{point.longitude}&q={encoded_name}",
                        '_distance_for_sorting': distance  # Internal field for sorting
                    })
            
            # Sort by distance
            nearby_points.sort(key=lambda x: x['_distance_for_sorting'])
            
            # Remove internal sorting field
            for point in nearby_points:
                del point['_distance_for_sorting']
            
            logger.info(f"Found {len(nearby_points)} recycling points within {radius_meters}m from ({latitude}, {longitude})")
            
            return nearby_points
            
        except Exception as e:
            logger.error(f"Error searching nearby recycling points: {str(e)}")
            return []
    
    def search_nearby_recycling_points_by_address(
        self,
        address: str,
        radius_meters: int = 5000
    ) -> Dict:
        """
        Search for nearby RecyclingPoints from an address string.
        
        Combines Google Geocoding API to convert address to coordinates,
        then searches for recycling points nearby.
        
        Args:
            address: Address string (e.g., "Rua Augusta 1000, São Paulo, SP")
            radius_meters: Search radius in meters (default 5000)
            
        Returns:
            Dictionary with geocoding info and nearby recycling points
        """
        try:
            logger.info(f"Searching nearby recycling points for address: {address}")
            
            # Step 1: Geocode the address
            coordinates = self.geocode_address(address)
            
            if not coordinates:
                logger.warning(f"Could not geocode address: {address}")
                return {
                    'success': False,
                    'error': 'Could not geocode the provided address',
                    'address': address,
                    'recycling_points': []
                }
            
            latitude, longitude = coordinates
            
            # Step 2: Search for nearby recycling points using the coordinates
            nearby_points = self.search_nearby_recycling_points(
                latitude=latitude,
                longitude=longitude,
                radius_meters=radius_meters
            )
            
            return {
                'success': True,
                'address': address,
                'geocoded_location': {
                    'latitude': latitude,
                    'longitude': longitude
                },
                'search_radius_meters': radius_meters,
                'total_found': len(nearby_points),
                'recycling_points': nearby_points
            }
            
        except Exception as e:
            logger.error(f"Error in search_nearby_recycling_points_by_address: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'address': address,
                'recycling_points': []
            }





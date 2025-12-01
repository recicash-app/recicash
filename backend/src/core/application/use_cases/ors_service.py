"""
Service for integrating with the Open Route Service (ORS) API.

Provides functionality to:
- Retrieve RecyclingPoint locations from the database
- Search for nearby recycling points using ORS geocoding and search
- Geocode addresses to coordinates using ORS geocoding API
- Generate Google Maps URLs for viewing RecyclingPoint locations (for display only)
"""

import logging
import math
import requests
from typing import Dict, Optional, List, Tuple
from urllib.parse import quote
from django.conf import settings
from core.domain.models import RecyclingPoint

logger = logging.getLogger(__name__)


class ORSService:
    """
    Service to interact with ORS API for RecyclingPoint locations.
    
    Requires the following settings to be configured:
    - ORS_API_KEY: Your ORS API key
    """
    
    def __init__(self):
        """Initialize service with API key from settings."""
        self.api_key = getattr(settings, 'ORS_API_KEY', None)
        if not self.api_key:
            logger.warning("ORS_API_KEY is not configured in settings")
    
    def get_recycling_point_details(self, recycling_point_id: str) -> Optional[Dict]:
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
            logger.error("ORS API key is not configured")
            return None
        
        try:
            GEOCODING_API_URL = "https://api.openrouteservice.org/geocode/search"
            
            headers = {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            }

            params = {
                'text': address,
                'api_key': self.api_key,
            }
            
            logger.info(f"Geocoding address using ORS: {address}")
            
            try:
                response = requests.get(GEOCODING_API_URL, params=params, headers=headers, timeout=100)
                response.raise_for_status()
            except requests.exceptions.HTTPError as http_err:
                logger.error(f"HTTP error occurred while geocoding: {http_err}")
                return None
            except requests.exceptions.ConnectionError as conn_err:
                logger.error(f"Connection error occurred while geocoding: {conn_err}")
                return None
            except requests.exceptions.Timeout as timeout_err:
                logger.error(f"Timeout error occurred while geocoding: {timeout_err}")
                return None
            except requests.exceptions.RequestException as req_err:
                logger.error(f"Request error occurred while geocoding: {req_err}")
                return None
            
            data = response.json()
            
            # Get the first result
            location = data['features'][0]['geometry']['coordinates']
            longitude = location[0]
            latitude = location[1]
            
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
            
            lat1 = math.radians(latitude)
            lon1 = math.radians(longitude)
            for point in all_points:
                # Haversine formula to calculate distance between two coordinates
                lat2 = math.radians(float(point.latitude))
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
        
        Combines ORS Geocoding API to convert address to coordinates,
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





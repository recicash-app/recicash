"""
Service for integrating with Google Maps API.

Provides functionality to:
- Retrieve RecyclingPoint locations using Google Maps
- Search for nearby recycling points in the database
"""

import logging
import math
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





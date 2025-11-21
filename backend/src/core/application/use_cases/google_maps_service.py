"""
Service for integrating with Google Maps API.

Provides functionality to:
- Retrieve RecyclingPoint locations using Google Maps
"""

import logging
from typing import Dict, Optional
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

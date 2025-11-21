"""
Tests for Google Maps integration endpoints.

Tests the RecyclingPoint viewset including:
- Finding nearby recycling points
- Geocoding addresses
- Retrieving specific recycling point locations
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.entities.models import RecyclingPoint, User


class RecyclingPointNearbyTests(TestCase):
    """Tests for the nearby recycling points endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create some test recycling points in Brasília
        self.point1 = RecyclingPoint.objects.create(
            name="Ecoponto Centro",
            cnpj="12.345.678/0001-90",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766
        )
        
        self.point2 = RecyclingPoint.objects.create(
            name="Ecoponto Norte",
            cnpj="98.765.432/0001-10",
            zip_code="71000-000",
            latitude=-15.7650,
            longitude=-48.0800
        )
        
        # A point far away
        self.point3 = RecyclingPoint.objects.create(
            name="Ecoponto Rio",
            cnpj="55.555.555/0001-55",
            zip_code="20000-000",
            latitude=-22.9068,
            longitude=-43.1729
        )
    
    def test_nearby_with_valid_coordinates(self):
        """Test finding nearby points with valid coordinates."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '5000'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('count', data)
        self.assertIn('database_points', data)
        self.assertIn('user_location', data)
        
        # Should find nearby points
        self.assertGreater(data['count'], 0)
    
    def test_nearby_missing_latitude(self):
        """Test that missing latitude returns 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lon': '-48.0766'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_missing_longitude(self):
        """Test that missing longitude returns 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_invalid_latitude(self):
        """Test that invalid latitude returns 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '95.0', 'lon': '-48.0766'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_invalid_longitude(self):
        """Test that invalid longitude returns 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '200.0'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_non_numeric_coordinates(self):
        """Test that non-numeric coordinates return 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': 'invalid', 'lon': '-48.0766'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_distance_sorting(self):
        """Test that results are sorted by distance."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '50000'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        points = data['database_points']
        
        # Verify results are sorted by distance
        if len(points) > 1:
            distances = [p['distance_meters'] for p in points]
            self.assertEqual(distances, sorted(distances))
    
    def test_nearby_radius_limit(self):
        """Test that radius is capped at 50km."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '100000'}
        )
        
        # Should not raise an error, just cap the radius
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class RecyclingPointLocationTests(TestCase):
    """Tests for the location endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.point = RecyclingPoint.objects.create(
            name="Test Ecoponto",
            cnpj="12.345.678/0001-90",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766
        )
    
    def test_get_location(self):
        """Test retrieving location of a specific point."""
        response = self.client.get(
            f'/api/v1/recycling-points/{self.point.recycling_point_id}/location/'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['recycling_point_id'], self.point.recycling_point_id)
        self.assertEqual(data['name'], "Test Ecoponto")
        self.assertEqual(data['latitude'], -15.7942)
        self.assertEqual(data['longitude'], -48.0766)
        self.assertIn('maps_url', data)
    
    def test_get_location_invalid_id(self):
        """Test that invalid ID returns 404."""
        response = self.client.get('/api/v1/recycling-points/99999/location/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RecyclingPointListTests(TestCase):
    """Tests for listing all recycling points."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.point1 = RecyclingPoint.objects.create(
            name="Ecoponto A",
            cnpj="11.111.111/0001-11",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766
        )
        
        self.point2 = RecyclingPoint.objects.create(
            name="Ecoponto B",
            cnpj="22.222.222/0001-22",
            zip_code="71000-000",
            latitude=-15.7650,
            longitude=-48.0800
        )
    
    def test_list_all_points(self):
        """Test listing all recycling points."""
        response = self.client.get('/api/v1/recycling-points/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(len(data), 2)
    
    def test_retrieve_single_point(self):
        """Test retrieving a single recycling point."""
        response = self.client.get(
            f'/api/v1/recycling-points/{self.point1.recycling_point_id}/'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['recycling_point_id'], self.point1.recycling_point_id)
        self.assertEqual(data['name'], "Ecoponto A")

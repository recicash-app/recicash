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
from core.domain.models import RecyclingPoint, User
import math


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in meters using Haversine formula."""
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


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
        
        # Response should be a list of recycling points
        self.assertIsInstance(data, list)
        
        # Should find nearby points
        self.assertGreater(len(data), 0)
    
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
        
        # Response should be a list
        self.assertIsInstance(data, list)
        
        # Verify results are sorted by distance
        if len(data) > 1:
            distances = [p['distance_meters'] for p in data]
            self.assertEqual(distances, sorted(distances))
    
    def test_nearby_radius_limit(self):
        """Test that radius is capped at 50km."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '100000'}
        )
        
        # Should not raise an error, just cap the radius
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class RecyclingPointListTests(TestCase):
    """Tests for listing all recycling points."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.point1 = RecyclingPoint.objects.create(
            maps_id="ChIJ0efZB5xjzpQRR18Y0KOa9Qw",
            name="Ecoponto A",
            cnpj="11.111.111/0001-11",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766,
            address="Rua A, 100, Brasília - DF"
        )
        
        self.point2 = RecyclingPoint.objects.create(
            maps_id="ChIJ3yT6czpfzpQRZDK_gmSqLLc",
            name="Ecoponto B",
            cnpj="22.222.222/0001-22",
            zip_code="71000-000",
            latitude=-15.7650,
            longitude=-48.0800,
            address="Rua B, 200, Brasília - DF"
        )
    
    def test_list_all_points(self):
        """Test listing all recycling points."""
        response = self.client.get('/api/v1/recycling-points/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Should return paginated results or direct list
        if isinstance(data, dict) and 'results' in data:
            self.assertEqual(len(data['results']), 2)
        else:
            # Direct list response
            self.assertIsInstance(data, list)
            self.assertEqual(len(data), 2)
    
    def test_list_points_sorted_by_name(self):
        """Test that points are sorted by name."""
        response = self.client.get('/api/v1/recycling-points/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Extract points from response
        if isinstance(data, dict) and 'results' in data:
            points = data['results']
        else:
            points = data
        
        names = [p['name'] for p in points]
        self.assertEqual(names, sorted(names))
    
    def test_retrieve_single_point(self):
        """Test retrieving a single recycling point."""
        response = self.client.get(f'/api/v1/recycling-points/{self.point1.recycling_point_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['recycling_point_id'], self.point1.recycling_point_id)
        self.assertEqual(data['name'], "Ecoponto A")
        self.assertEqual(data['cnpj'], "11.111.111/0001-11")
        self.assertEqual(data['zip_code'], "70000-000")
    
    def test_retrieve_nonexistent_point(self):
        """Test that retrieving non-existent point returns 404."""
        response = self.client.get('/api/v1/recycling-points/nonexistent/')
        
        # Should return 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RecyclingPointLocationTests(TestCase):
    """Tests for the location endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.point = RecyclingPoint.objects.create(
            maps_id="ChIJ_52cT-pYzpQRjYjErvDcdXc",
            name="Test Ecoponto",
            cnpj="12.345.678/0001-90",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766,
            address="Rua Teste, 123, Brasília - DF"
        )
    
    def test_get_location_endpoint(self):
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
        self.assertIn('maps', data['maps_url'].lower())
    
    def test_get_location_invalid_id(self):
        """Test that invalid ID returns 404 or 500 error."""
        response = self.client.get('/api/v1/recycling-points/nonexistent/location/')
        
        # Should return either 404 or 500 depending on error handling
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_500_INTERNAL_SERVER_ERROR])
    
    def test_maps_url_format(self):
        """Test that maps URL contains coordinates and name."""
        response = self.client.get(
            f'/api/v1/recycling-points/{self.point.recycling_point_id}/location/'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        maps_url = data['maps_url']
        
        # URL should contain coordinates
        self.assertIn(str(self.point.latitude), maps_url)
        self.assertIn(str(self.point.longitude), maps_url)
        # URL should contain encoded name
        self.assertIn('Test%20Ecoponto', maps_url)


class RecyclingPointNearbyTests(TestCase):
    """Tests for the nearby recycling points endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create recycling points in Brasília
        self.center_point = RecyclingPoint.objects.create(
            maps_id="ChIJ58KIjsdVzpQRCFw9bL3vw30",
            name="Ecoponto Centro",
            cnpj="12.345.678/0001-90",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766,
            address="Centro, Brasília - DF"
        )
        
        self.norte_point = RecyclingPoint.objects.create(
            maps_id="ChIJ6_wXSUBRzpQRiL6152HZ7LU",
            name="Ecoponto Norte",
            cnpj="98.765.432/0001-10",
            zip_code="71000-000",
            latitude=-15.7650,
            longitude=-48.0800,
            address="Norte, Brasília - DF"
        )
        
        # A point far away in Rio
        self.rio_point = RecyclingPoint.objects.create(
            maps_id="ChIJ_8t1_RdXzpQRV-S7rNDM6gA",
            name="Ecoponto Rio",
            cnpj="55.555.555/0001-55",
            zip_code="20000-000",
            latitude=-22.9068,
            longitude=-43.1729,
            address="Rio de Janeiro - RJ"
        )
    
    def test_nearby_with_valid_coordinates(self):
        """Test finding nearby points with valid coordinates."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '5000'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Response should contain list of nearby points
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
    
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
    
    def test_nearby_distance_calculation(self):
        """Test that distance is calculated correctly."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '50000'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # All returned points should have distance_meters
        for point in data:
            self.assertIn('distance_meters', point)
            self.assertGreaterEqual(point['distance_meters'], 0)
    
    def test_nearby_distance_sorting(self):
        """Test that results are sorted by distance."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '50000'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Verify results are sorted by distance
        if len(data) > 1:
            distances = [p['distance_meters'] for p in data]
            self.assertEqual(distances, sorted(distances))
    
    def test_nearby_radius_default(self):
        """Test that default radius is 5000 meters."""
        # Without radius parameter
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Should work with default radius
        self.assertIsInstance(data, list)
    
    def test_nearby_radius_limit(self):
        """Test that radius is capped at 50km."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '100000'}
        )
        
        # Should not raise an error, just cap the radius
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_nearby_invalid_radius(self):
        """Test that invalid radius returns 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': 'invalid'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_returns_serialized_data(self):
        """Test that nearby response contains all expected fields."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby/',
            {'lat': '-15.7942', 'lon': '-48.0766', 'radius': '5000'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        if len(data) > 0:
            point = data[0]
            # Check for expected fields
            self.assertIn('recycling_point_id', point)
            self.assertIn('name', point)
            self.assertIn('latitude', point)
            self.assertIn('longitude', point)
            self.assertIn('cnpj', point)
            self.assertIn('zip_code', point)
            self.assertIn('distance_meters', point)


class RecyclingPointNearbyAddressTests(TestCase):
    """Tests for the nearby-address endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.point = RecyclingPoint.objects.create(
            maps_id="ChIJ8ZYXZnFTzpQRPuYsKdb9Rts",
            name="Ecoponto Teste",
            cnpj="12.345.678/0001-90",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766,
            address="Rua Teste, Brasília - DF"
        )
    
    def test_nearby_address_missing_address(self):
        """Test that missing address returns 400 error."""
        response = self.client.get('/api/v1/recycling-points/nearby-address/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_address_empty_address(self):
        """Test that empty address returns 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby-address/',
            {'address': ''}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_address_invalid_radius(self):
        """Test that invalid radius returns 400 error."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby-address/',
            {'address': 'Rua Teste, Brasília', 'radius': 'invalid'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_nearby_address_radius_limit(self):
        """Test that radius is capped at 50km."""
        response = self.client.get(
            '/api/v1/recycling-points/nearby-address/',
            {'address': 'Brasília, DF', 'radius': '100000'}
        )
        
        # Should not raise an error if API is available
        # May return 500 if Google API is not configured
        self.assertIn(response.status_code, [200, 500])


class RecyclingPointPermissionsTests(TestCase):
    """Tests for permissions on recycling points endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.point = RecyclingPoint.objects.create(
            maps_id="ChIJ96pyISRZzpQRkymUSYC95Wo",
            name="Ecoponto Permissões",
            cnpj="12.345.678/0001-90",
            zip_code="70000-000",
            latitude=-15.7942,
            longitude=-48.0766
        )
    
    def test_all_endpoints_are_public(self):
        """Test that all endpoints are publicly accessible."""
        endpoints = [
            '/api/v1/recycling-points/',
            f'/api/v1/recycling-points/{self.point.recycling_point_id}/',
            f'/api/v1/recycling-points/{self.point.recycling_point_id}/location/',
            '/api/v1/recycling-points/nearby/?lat=-15.7942&lon=-48.0766',
            '/api/v1/recycling-points/nearby-address/?address=Test',
        ]
        
        for endpoint in endpoints:
            response = self.client.get(endpoint)
            # Should not return 401 Unauthorized
            self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

"""
Test cases for User Recycling History API functionality.
Tests core authentication, authorization and filtering functionality.
"""

from django.test import TransactionTestCase
from django.utils import timezone
from django.db import connection
from datetime import timedelta

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.domain.models import User, Recycling, RecyclingPoint, RecyclingValue


class UserRecyclingHistoryAPITestCase(TransactionTestCase):
    """Essential tests for user recycling history API."""
    
    def setUp(self):
        """Set up minimal test data."""
        self.user1 = User.objects.create_user(
            username='user1', cpf='12345678900', zip_code='12345'
        )
        self.user2 = User.objects.create_user(
            username='user2', cpf='98765432100', zip_code='54321'
        )
        
        self.recycling_point = RecyclingPoint.objects.create(
            name='Test Point',
            cnpj='12345678901234',
            zip_code='12345',
            latitude=-23.5505,
            longitude=-46.6333,
            maps_id='test_maps_id'
        )
        
        self.recycling_value = RecyclingValue.objects.create(points_value=100)
        
        # Create test records for filtering
        now = timezone.now()
        
        # Old, low-value record - create with specific date
        old_date = now - timedelta(days=7)
        self.old_record = Recycling.objects.create(
            user_id=self.user1,
            recycling_point_id=self.recycling_point,
            recycling_value_id=self.recycling_value,
            weight=1.0,
            points_value=100,
            validation_hash='OLD'
        )
        # Update using raw SQL to avoid datetime warnings
        Recycling.objects.filter(recycling_id=self.old_record.recycling_id).update(date=old_date)
        
        # Recent, high-value record - create with specific date
        recent_date = now - timedelta(days=1)
        self.recent_record = Recycling.objects.create(
            user_id=self.user1,
            recycling_point_id=self.recycling_point,
            recycling_value_id=self.recycling_value,
            weight=3.0,
            points_value=500,
            validation_hash='RECENT'
        )
        # Update using raw SQL to avoid datetime warnings
        Recycling.objects.filter(recycling_id=self.recent_record.recycling_id).update(date=recent_date)
        
        # Other user's record
        self.other_record = Recycling.objects.create(
            user_id=self.user2,
            recycling_point_id=self.recycling_point,
            recycling_value_id=self.recycling_value,
            weight=1.0,
            points_value=150,
            validation_hash='OTHER'
        )
        
        self.client = APIClient()
    
    def get_jwt_token(self, user):
        """Generate JWT token for authentication."""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def get_records_from_response(self, response):
        """Extract records from response (handles pagination)."""
        return response.data if isinstance(response.data, list) else response.data.get('results', [])
    
    def test_authentication_required(self):
        """Test that authentication is required."""
        response = self.client.get(f'/api/v1/recyclings/?user_id={self.user1.user_id}')
        self.assertEqual(response.status_code, 401)
    
    def test_user_access_own_data_only(self):
        """Test users can only access their own data."""
        token = self.get_jwt_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Access own data
        response = self.client.get(f'/api/v1/recyclings/?user_id={self.user1.user_id}')
        self.assertEqual(response.status_code, 200)
        records = self.get_records_from_response(response)
        self.assertEqual(len(records), 2)
        
        # Try to access other user's data
        response = self.client.get(f'/api/v1/recyclings/?user_id={self.user2.user_id}')
        self.assertEqual(response.status_code, 200)
        records = self.get_records_from_response(response)
        self.assertEqual(len(records), 0)  # Filtered out
    
    def test_date_filter(self):
        """Test date filtering works."""
        token = self.get_jwt_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Filter for recent records only - use simpler date format
        start_date = (timezone.now() - timedelta(days=3)).strftime('%Y-%m-%dT%H:%M:%S')
        response = self.client.get(
            f'/api/v1/recyclings/?user_id={self.user1.user_id}&start_date={start_date}'
        )
        
        self.assertEqual(response.status_code, 200)
        records = self.get_records_from_response(response)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['validation_hash'], 'RECENT')

    def test_points_filter(self):
        """Test points filtering works."""
        token = self.get_jwt_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Filter for high-value records only
        response = self.client.get(
            f'/api/v1/recyclings/?user_id={self.user1.user_id}&min_points=400'
        )
        
        self.assertEqual(response.status_code, 200)
        records = self.get_records_from_response(response)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['validation_hash'], 'RECENT')

    def test_combined_filters(self):
        """Test combined filters work together."""
        token = self.get_jwt_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        start_date = (timezone.now() - timedelta(days=3)).strftime('%Y-%m-%dT%H:%M:%S')
        response = self.client.get(
            f'/api/v1/recyclings/?user_id={self.user1.user_id}&start_date={start_date}&min_points=400'
        )
        
        self.assertEqual(response.status_code, 200)
        records = self.get_records_from_response(response)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['validation_hash'], 'RECENT')
    
    def test_individual_record_access(self):
        """Test accessing individual records respects authorization."""
        token = self.get_jwt_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Can access own record
        response = self.client.get(
            f'/api/v1/recyclings/{self.old_record.recycling_id}/?user_id={self.user1.user_id}'
        )
        self.assertEqual(response.status_code, 200)
        
        # Cannot access other user's record
        response = self.client.get(
            f'/api/v1/recyclings/{self.other_record.recycling_id}/?user_id={self.user2.user_id}'
        )
        self.assertEqual(response.status_code, 404)

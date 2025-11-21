"""
API Integration tests for Blog Search functionality.
Tests the complete flow: HTTP Request → View → Service → Database
"""

from django.test import TestCase, Client
from django.urls import reverse
from apps.entities.models import PostBlog, User
import json


class BlogSearchAPIIntegrationTestCase(TestCase):
    """Integration tests for Blog Search API endpoints."""

    def setUp(self):
        """Set up test data for API integration tests."""
        self.client = Client()
        
        # Create a test user for posts that require author
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        # Create test posts for API integration
        self.posts = [
            PostBlog.objects.create(
                title="API Test: Reciclagem de plástico",
                text="Conteúdo sobre reciclagem",
                author_id=self.test_user
            ),
            PostBlog.objects.create(
                title="API Test: Separação de resíduos",
                text="Guia de separação",
                author_id=self.test_user
            )
        ]

    def test_search_api_integration(self):
        """Test complete search API flow."""
        response = self.client.get('/api/v1/posts/search/?q=reciclagem')
        
        # API should work (may require authentication)
        if response.status_code == 200:
            data = json.loads(response.content)
            
            # Validate response structure
            self.assertIn('query', data)
            self.assertIn('count', data) 
            self.assertIn('results', data)
            self.assertEqual(data['query'], 'reciclagem')
            self.assertIsInstance(data['results'], list)
        else:
            # If authentication required, should return 401/403
            self.assertIn(response.status_code, [401, 403])

    def test_suggestions_api_integration(self):
        """Test complete suggestions API flow.""" 
        response = self.client.get('/api/v1/posts/search_suggestions/?q=rec')
        
        if response.status_code == 200:
            data = json.loads(response.content)
            self.assertIn('query', data)
            self.assertIn('suggestions', data)
        else:
            self.assertIn(response.status_code, [401, 403])

    def test_api_error_handling(self):
        """Test API error responses."""
        response = self.client.get('/api/v1/posts/search/')
        self.assertIn(response.status_code, [400, 401, 403])
        
        response = self.client.get('/api/v1/posts/invalid-endpoint/')
        self.assertEqual(response.status_code, 404)
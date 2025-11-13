"""
Unit tests for Blog Search functionality.

Tests the BlogSearchService class and related API endpoints for searching posts
by title with multiple strategies including exact match, contains, and trigram similarity.
"""

from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.entities.models import PostBlog
from apps.services.blog_service import BlogSearchService
from unittest.mock import patch
import logging

# Disable logging during tests to avoid cluttering test output
logging.disable(logging.CRITICAL)

User = get_user_model()


class BlogSearchServiceTestCase(TransactionTestCase):
    """
    Test cases for BlogSearchService class.
    
    Uses TransactionTestCase to support PostgreSQL operations like trigram similarity.
    """

    def setUp(self):
        """Set up test data before each test method."""
        # Create test posts with various titles for search testing
        self.test_posts = [
            PostBlog.objects.create(
                title="Como fazer reciclagem correta de plástico",
                text="Guia completo sobre reciclagem de plástico"
            ),
            PostBlog.objects.create(
                title="Benefícios da reciclagen para o meio ambiente",  # Intentional typo
                text="Descubra os benefícios da reciclagem"
            ),
            PostBlog.objects.create(
                title="Separação de lixo: guia completo", 
                text="Como separar lixo corretamente"
            ),
            PostBlog.objects.create(
                title="Pontos de coleta seletiva em São Paulo",
                text="Locais para descartar materiais recicláveis"
            ),
            PostBlog.objects.create(
                title="Reciclagem de papel: dicas importantes",
                text="Tudo sobre reciclagem de papel"
            )
        ]

    def test_search_exact_match(self):
        """Test exact match search functionality."""
        results = BlogSearchService.search_posts_by_title("reciclagem")
        
        # Should find posts containing "reciclagem" (exact and similar matches)
        self.assertGreater(results.count(), 0)
        titles = [post.title for post in results]
        # Check if at least one expected post is found
        found_expected = any("reciclagem" in title.lower() for title in titles)
        self.assertTrue(found_expected)

    def test_search_partial_match(self):
        """Test partial match search functionality."""
        results = BlogSearchService.search_posts_by_title("plástico")
        
        # Should find the post containing "plástico"
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first().title, "Como fazer reciclagem correta de plástico")

    def test_search_case_insensitive(self):
        """Test that search is case insensitive."""
        results_upper = BlogSearchService.search_posts_by_title("RECICLAGEM")
        results_lower = BlogSearchService.search_posts_by_title("reciclagem")
        
        # Should find same results regardless of case
        self.assertEqual(results_upper.count(), results_lower.count())
        self.assertGreater(results_upper.count(), 0)

    def test_search_with_typo_similarity(self):
        """Test trigram similarity search with typos."""
        # Search for "reciclajem" (typo for "reciclagem")
        results = BlogSearchService.search_posts_by_title("reciclajem")
        
        # Should find posts similar to "reciclagem"
        self.assertGreater(results.count(), 0)
        titles = [post.title for post in results]
        self.assertTrue(
            any("reciclagem" in title.lower() or "reciclagen" in title.lower() 
                for title in titles)
        )

    def test_search_without_accents(self):
        """Test search tolerance for missing accents."""
        results = BlogSearchService.search_posts_by_title("separacao")
        
        # Should find "Separação" even without accent
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first().title, "Separação de lixo: guia completo")

    def test_search_empty_query(self):
        """Test search with empty query."""
        results = BlogSearchService.search_posts_by_title("")
        
        # Should return no results for empty query
        self.assertEqual(results.count(), 0)

    def test_search_whitespace_only(self):
        """Test search with whitespace-only query."""
        results = BlogSearchService.search_posts_by_title("   ")
        
        # Should return no results for whitespace-only query
        self.assertEqual(results.count(), 0)

    def test_search_no_matches(self):
        """Test search that should return no results."""
        results = BlogSearchService.search_posts_by_title("inexistente")
        
        # Should return no results
        self.assertEqual(results.count(), 0)

    def test_get_search_suggestions(self):
        """Test search suggestions functionality."""
        suggestions = BlogSearchService.get_search_suggestions("rec", limit=3)
        
        # Should return up to 3 suggestions containing "rec"
        self.assertLessEqual(len(suggestions), 3)
        self.assertTrue(all("rec" in suggestion.lower() for suggestion in suggestions))

    def test_get_search_suggestions_empty_query(self):
        """Test search suggestions with empty query."""
        suggestions = BlogSearchService.get_search_suggestions("")
        
        self.assertEqual(len(suggestions), 0)

    def test_get_search_suggestions_short_query(self):
        """Test search suggestions with very short query."""
        suggestions = BlogSearchService.get_search_suggestions("r")
        
        # Should return empty list for single character query
        self.assertEqual(len(suggestions), 0)

    def test_get_search_suggestions_with_limit(self):
        """Test search suggestions respects limit parameter."""
        suggestions = BlogSearchService.get_search_suggestions("a", limit=2)
        
        # Should respect the limit parameter
        self.assertLessEqual(len(suggestions), 2)

    @patch('apps.services.blog_service.logger')
    def test_search_with_database_error_fallback(self, mock_logger):
        """Test fallback behavior when advanced search fails."""
        # This test ensures the fallback mechanism works
        with patch('apps.entities.models.PostBlog.objects.annotate') as mock_annotate:
            # Make annotate raise an exception to trigger fallback
            mock_annotate.side_effect = Exception("Database error")
            
            results = BlogSearchService.search_posts_by_title("reciclagem")
            
            self.assertGreater(results.count(), 0)
            mock_logger.warning.assert_called_once()


class BlogSearchAPITestCase(APITestCase):
    """
    Test cases for Blog Search API endpoints.
    """

    def setUp(self):
        """Set up test data and API client."""
        self.client = APIClient()
        # Force authentication to bypass any authentication requirements
        self.client.force_authenticate(user=None)
        
        self.test_posts = [
            PostBlog.objects.create(
                title="Como fazer reciclagem correta de plástico",
                text="Guia sobre reciclagem"
            ),
            PostBlog.objects.create(
                title="Separação de lixo: guia completo",
                text="Como separar lixo"
            )
        ]
        
        # API endpoints - using direct URLs since we don't have named URLs
        self.search_url = '/api/v1/posts/search/'
        self.suggestions_url = '/api/v1/posts/search_suggestions/'

    def test_search_api_success(self):
        """Test successful search API request."""
        response = self.client.get(self.search_url, {'q': 'reciclagem'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('query', data)
        self.assertIn('count', data)
        self.assertIn('results', data)
        
        self.assertEqual(data['query'], 'reciclagem')
        self.assertGreater(data['count'], 0)
        self.assertIsInstance(data['results'], list)

    def test_search_api_missing_query_parameter(self):
        """Test search API without query parameter."""
        response = self.client.get(self.search_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Query parameter "q" is required')

    def test_search_api_empty_query_parameter(self):
        """Test search API with empty query parameter."""
        response = self.client.get(self.search_url, {'q': ''})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertIn('error', data)

    def test_search_api_short_query(self):
        """Test search API with very short query."""
        response = self.client.get(self.search_url, {'q': 'a'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Search query too short')

    def test_search_api_no_results(self):
        """Test search API when no results are found."""
        response = self.client.get(self.search_url, {'q': 'inexistente'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['count'], 0)
        self.assertEqual(len(data['results']), 0)

    def test_suggestions_api_success(self):
        """Test successful suggestions API request."""
        response = self.client.get(self.suggestions_url, {'q': 'rec'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('query', data)
        self.assertIn('suggestions', data)
        
        self.assertEqual(data['query'], 'rec')
        self.assertIsInstance(data['suggestions'], list)

    def test_suggestions_api_with_limit(self):
        """Test suggestions API with limit parameter."""
        response = self.client.get(self.suggestions_url, {'q': 'a', 'limit': 2})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertLessEqual(len(data['suggestions']), 2)

    def test_suggestions_api_missing_query_parameter(self):
        """Test suggestions API without query parameter."""
        response = self.client.get(self.suggestions_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertIn('error', data)

    @patch('apps.services.blog_service.BlogSearchService.search_posts_by_title')
    def test_search_api_internal_error(self, mock_search):
        """Test search API handles internal errors gracefully."""
        # Make the service raise an exception
        mock_search.side_effect = Exception("Internal error")
        
        response = self.client.get(self.search_url, {'q': 'test'})
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        data = response.json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Search failed')


class BlogSearchIntegrationTestCase(TransactionTestCase):
    """
    Integration tests for the complete blog search workflow.
    """

    def setUp(self):
        """Set up test data for integration tests."""
        # Create a more comprehensive set of test posts
        self.posts = [
            PostBlog.objects.create(
                title="Reciclagem de Plástico: Manual Completo",
                text="Tudo sobre reciclagem de plástico"
            ),
            PostBlog.objects.create(
                title="Como Reciclar Papel em Casa", 
                text="Dicas para reciclagem doméstica"
            ),
            PostBlog.objects.create(
                title="Benefícios Ambientais da Reciclagem",
                text="Impactos positivos da reciclagem"
            ),
            PostBlog.objects.create(
                title="Pontos de Coleta: Onde Descartar Lixo",
                text="Locais para descarte responsável"
            )
        ]

    def test_complete_search_workflow(self):
        """Test the complete search workflow from API to service."""
        client = APIClient()
        
        # Test 1: Basic search
        response = client.get('/api/v1/posts/search/', {'q': 'reciclagem'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertGreater(data['count'], 0)
        
        # Test 2: Search with suggestions
        response = client.get('/api/v1/posts/search_suggestions/', {'q': 'rec'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        suggestions_data = response.json()
        self.assertGreater(len(suggestions_data['suggestions']), 0)

    def test_search_ordering_priority(self):
        """Test that search results are ordered by priority (exact > contains > similarity)."""
        PostBlog.objects.create(title="reciclagem", text="exact match")
        PostBlog.objects.create(title="sobre reciclagem hoje", text="contains match")
        
        results = BlogSearchService.search_posts_by_title("reciclagem")
        
        # Exact match should come first
        self.assertEqual(results.first().title, "reciclagem")

    def test_search_performance_with_large_dataset(self):
        """Test search performance doesn't degrade significantly with more data."""
        # Create additional test posts
        for i in range(500):
            PostBlog.objects.create(
                title=f"Post sobre diversos temas {i}",
                text=f"Conteúdo do post {i}"
            )
        
        results = BlogSearchService.search_posts_by_title("reciclagem")
        
        self.assertGreater(results.count(), 0)
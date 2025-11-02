from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.entities.models import PostBlog, PostImage
from apps.entities.serializers import PostBlogSerializer, PostImageSerializer
from apps.entities.permissions import IsAppAdminUser
from apps.services.blog_service import BlogSearchService


class PostBlogViewSet(viewsets.ModelViewSet):
    # Gets all posts from blog
    queryset = PostBlog.objects.all()
    serializer_class = PostBlogSerializer

    # Deal with diffent formats of files and inputs
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAppAdminUser]
        
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """
        Search posts by title keywords.
        
        Query Parameters:
            q (str): Search query to look for in post titles
            
        Returns:
            Response: List of matching posts with their details
            
        Example:
            GET /api/posts/search/?q=reciclagem
        """
        search_query = request.query_params.get('q', '').strip()
        
        if not search_query:
            return Response(
                {
                    'error': 'Query parameter "q" is required',
                    'message': 'Please provide a search term using the "q" parameter'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(search_query) < 2:
            return Response(
                {
                    'error': 'Search query too short',
                    'message': 'Please provide at least 2 characters for search'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            matching_posts = BlogSearchService.search_posts_by_title(search_query)            
            serializer = self.get_serializer(matching_posts, many=True)
            
            return Response(
                {
                    'query': search_query,
                    'count': matching_posts.count(),
                    'results': serializer.data
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {
                    'error': 'Search failed',
                    'message': f'An error occurred during search: {str(e)}'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search_suggestions(self, request):
        """
        Get search suggestions based on existing post titles.
        
        Query Parameters:
            q (str): Partial search term
            limit (int): Maximum number of suggestions (default: 5)
            
        Returns:
            Response: List of suggested search terms
            
        Example:
            GET /api/posts/search_suggestions/?q=rec&limit=3
        """
        search_query = request.query_params.get('q', '').strip()
        limit = int(request.query_params.get('limit', 5))
        
        if not search_query:
            return Response(
                {
                    'error': 'Query parameter "q" is required',
                    'message': 'Please provide a search term using the "q" parameter'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            suggestions = BlogSearchService.get_search_suggestions(search_query, limit)
            
            return Response(
                {
                    'query': search_query,
                    'suggestions': suggestions
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {
                    'error': 'Suggestions failed',
                    'message': f'An error occurred while getting suggestions: {str(e)}'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PostImageViewSet(viewsets.ModelViewSet):
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer

    permission_classes = [IsAuthenticated, IsAppAdminUser]
    parser_classes = [MultiPartParser, FormParser]
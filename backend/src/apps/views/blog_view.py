from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.entities.models import PostBlog, PostImage
from apps.entities.serializers import User, PostBlogSerializer, PostImageSerializer
from apps.entities.permissions import IsAppAdminUser
from apps.services.blog_service import BlogSearchService
from apps.services.paginator_service import PaginatorService


class PostBlogViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for PostBlog.

    Supported endpoints (mounted under router, e.g. /api/v1/posts/):
    - GET /           -> list posts (paginated if page & page_size provided)
    - GET /{id}/      -> retrieve a single post
    - POST /          -> create a post (expects multipart/form-data for file uploads)
    - PATCH /{id}/    -> partial update
    - DELETE /{id}/   -> delete

    Extra actions:
    - GET /search/?q=...             -> search posts by title
    - GET /search_suggestions/?q=... -> get title suggestions

    Notes:
    - parser_classes include MultiPartParser and FormParser so the view accepts multipart/form-data uploads.
    - perform_create currently saves a test author (User(pk=1)) and stores a single uploaded file in PostImage.
    """

    queryset = PostBlog.objects.all().order_by('-created_at')
    serializer_class = PostBlogSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        """
        Return permission objects depending on action.

        Current behavior:
        - list, retrieve, search, search_suggestions -> AllowAny (public)
        - other actions (create/update/delete) -> AllowAny (for local testing)

        To require authentication and admin role in production, replace the final return with:
            return [IsAuthenticated(), IsAppAdminUser()]

        For quick local testing without admin permissions leave AllowAny enabled.
        """
        if self.action in ["list", "retrieve", "search", "search_suggestions"]:
            return [AllowAny()]
        return [AllowAny()]
        # production: return [IsAuthenticated(), IsAppAdminUser()]

    def perform_create(self, serializer):
        """
        Save a new PostBlog and attach an uploaded file (if present).

        - For local/testing convenience this uses a fixed user:
            author = User.objects.get(pk=1)
          and calls serializer.save(author_id=author)
        - Expects uploaded file field name "image" (single file). If present,
          renames the file to use the created post.post_id and creates PostImage.
        """
        # For testing convenience we use a fixed user. In production you would use:
        # author = self.request.user
        author = User.objects.get(pk=1)
        post = serializer.save(author_id=author)

        image_file = self.request.FILES.get("image")
        if image_file:
            extension = image_file.name.split(".")[-1]
            image_file.name = f"{post.post_id}.{extension}"
            PostImage.objects.create(post=post, image=image_file)

    def list(self, request, *args, **kwargs):
        """
        List posts. Supports optional pagination via query params:
          - page (int)
          - page_size (int)

        When pagination params are provided, uses PaginatorService and returns
        a paginated dict with 'results' replaced by serialized posts (absolute image URLs).
        """
        queryset = self.get_queryset()
        page = request.query_params.get("page")
        page_size = request.query_params.get("page_size")

        if page and page_size:
            paginator = PaginatorService(
                queryset=queryset,
                page=int(page),
                page_size=int(page_size)
            )
            data = paginator.get_paginated_data()
            # Pass request in context so PostBlogSerializer can build absolute image URLs
            data["results"] = PostBlogSerializer(
                data["results"], many=True, context={"request": request}
            ).data
            return Response(data, status=status.HTTP_200_OK)

        serializer = PostBlogSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """
        Search posts by title keywords.

        Query Parameters:
            q (str): search query (required, min length 2)

        Response:
            200: { 'query': q, 'count': <int>, 'results': [<post objects>] }
            400: when q is missing or too short
            500: on server error
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
        Return title suggestions from existing posts.

        Query Parameters:
            q (str): partial search term (required)
            limit (int): maximum suggestions (default 5)

        Response:
            200: { 'query': q, 'suggestions': [<strings>] }
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

class PostImageRetrieveViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    Simple retrieve endpoint for PostImage objects.
    """
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer
    permission_classes = [AllowAny]
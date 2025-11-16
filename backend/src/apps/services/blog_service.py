"""
Blog Service

This service contains the business logic for blog operations,
including search functionality for posts.
"""

import logging
from typing import List
from django.db.models import Q, QuerySet
from django.contrib.postgres.search import TrigramSimilarity
from apps.entities.models import PostBlog


logger = logging.getLogger(__name__)


class BlogSearchService:
    """
    Service class responsible for blog post search operations.
    Implements multiple search strategies for robust text matching.
    """

    @staticmethod
    def search_posts_by_title(query: str) -> QuerySet[PostBlog]:
        """
        Search posts by title using multiple strategies for better matching.
        
        Strategies used:
        1. Exact case-insensitive match
        2. Case-insensitive contains (handles typos partially)
        3. Trigram similarity (handles accents and typos)
        
        Args:
            query (str): Search term to look for in post titles
            
        Returns:
            QuerySet[PostBlog]: Ordered queryset of matching posts
        """
        if not query or not query.strip():
            logger.warning("Empty search query provided")
            return PostBlog.objects.none()
        
        search_term = query.strip()
        logger.info(f"Searching posts with query: '{search_term}'")
        
        # Strategy 1: Exact case-insensitive match (highest priority)
        exact_matches = PostBlog.objects.filter(
            title__iexact=search_term
        )
        
        # Strategy 2: Case-insensitive contains (medium priority)
        # This handles partial matches and some typos
        contains_matches = PostBlog.objects.filter(
            title__icontains=search_term
        ).exclude(
            title__iexact=search_term  # Exclude exact matches already found
        )
        
        # Strategy 3: Trigram similarity (lower priority, handles typos and accents)
        # Requires PostgreSQL with pg_trgm extension
        try:
            similarity_matches = PostBlog.objects.annotate(
                similarity=TrigramSimilarity('title', search_term)
            ).filter(
                similarity__gt=0.1  # Lower threshold for similarity (10%)
            ).exclude(
                Q(title__iexact=search_term) | Q(title__icontains=search_term)
            )
            
            # Convert to list to combine results manually (avoids UNION column mismatch)
            results = []
            
            results.extend(list(exact_matches))
            results.extend(list(contains_matches))            
            similarity_list = list(similarity_matches.order_by('-similarity'))
            results.extend(similarity_list)
            
            # Remove duplicates while preserving order
            seen_ids = set()
            unique_results = []
            for post in results:
                if post.post_id not in seen_ids:
                    unique_results.append(post)
                    seen_ids.add(post.post_id)
            
            if unique_results:
                post_ids = [post.post_id for post in unique_results]
                # Preserve the order by using the sorted post_ids
                final_queryset = PostBlog.objects.filter(
                    post_id__in=post_ids
                ).extra(
                    select={'ordering': 'CASE ' + ' '.join([
                        f'WHEN post_id={pid} THEN {i}' 
                        for i, pid in enumerate(post_ids)
                    ]) + ' END'},
                    order_by=['ordering']
                )
                
                logger.info(f"Found {len(unique_results)} posts matching '{search_term}' (advanced search)")
                return final_queryset
            else:
                logger.info(f"No posts found matching '{search_term}'")
                return PostBlog.objects.none()
            
        except Exception as e:
            # Fallback to simple icontains if trigram similarity fails
            logger.warning(f"Advanced search failed, falling back to simple search: {e}")
            return PostBlog.objects.filter(
                title__icontains=search_term
            ).order_by('title')
    
    @staticmethod  
    def get_search_suggestions(query: str, limit: int = 5) -> List[str]:
        """
        Get search suggestions based on existing post titles.
        
        Args:
            query (str): Partial search term
            limit (int): Maximum number of suggestions to return
            
        Returns:
            List[str]: List of suggested search terms
        """
        if not query or len(query) < 2:
            return []
        
        # Get titles that contain the query (case-insensitive)
        suggestions = PostBlog.objects.filter(
            title__icontains=query.strip()
        ).values_list('title', flat=True)[:limit]
        
        return list(suggestions)
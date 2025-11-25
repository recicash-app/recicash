from math import ceil

class PaginatorService:
    """
    Generic paginator for QuerySets or lists.
    """
    def __init__(self, queryset, page=1, page_size=10):
        self.queryset = queryset
        self.page = max(1, int(page))
        self.page_size = max(1, int(page_size))
        self.total = queryset.count() if hasattr(queryset, 'count') else len(queryset)

    def get_paginated_data(self):
        start = (self.page - 1) * self.page_size
        end = start + self.page_size
        results = self.queryset[start:end]
        return {
            "count": self.total,
            "page": self.page,
            "page_size": self.page_size,
            "total_pages": ceil(self.total / self.page_size),
            "results": list(results),
        }
from rest_framework import permissions

class IsAppAdminUser(permissions.BasePermission):
    """
    Personalized permission for Admin Users
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # User ACCESS_LEVEL must be equals to 'A' for Admin.
        return request.user.access_level == 'A'
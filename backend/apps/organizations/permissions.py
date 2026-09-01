from rest_framework.permissions import BasePermission

'''
BasePermission class is used to define custom permissions for the Organization model. 
It allows only users with the role of ADMIN or MANAGER to manage organization resources.
'''
class IsAdminOrManager(BasePermission):
    """
    Allows ADMIN and MANAGER users to manage organization resources.
    """

    allowed_roles = {"ADMIN", "MANAGER"}

    def has_permission(self, request, view):
        user = request.user

        return (
            # is_authenticated checks if the user is authenticated, and role checks if the user's role is in the allowed_roles set.
            user.is_authenticated
            and user.role in self.allowed_roles
        )
from rest_framework.permissions import BasePermission


class IsAdminOrManager(BasePermission):
    """
    Allows ADMIN and MANAGER users to manage organization resources.
    """

    allowed_roles = {"ADMIN", "MANAGER"}

    def has_permission(self, request, view):
        user = request.user

        return (
            user.is_authenticated
            and user.role in self.allowed_roles
        )
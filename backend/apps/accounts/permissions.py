from rest_framework.permissions import BasePermission

from backend.apps.accounts.models import UserRole


class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class IsAdminOrManager(BasePermission):

    allowed_roles = {
        "ADMIN",
        "MANAGER",
    }

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )

class IsOwnerOrAdmin(BasePermission):

    def has_object_permission(self,request,view,obj,):
        return (
            obj == request.user
            or request.user.role == UserRole.ADMIN
        )
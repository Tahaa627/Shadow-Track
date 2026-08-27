from rest_framework.permissions import BasePermission

from .models import UserRole


class IsAdmin(BasePermission):
    """
    Only organization ADMIN users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsAdminOrManager(BasePermission):
    """
    ADMIN and MANAGER users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in (
                UserRole.ADMIN,
                UserRole.MANAGER,
            )
        )


class CanManageUser(BasePermission):
    """
    Controls which users can manage other users.

    ADMIN:
        Can manage everyone.

    MANAGER:
        Can manage MEMBER users only.

    MEMBER:
        Cannot manage other users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in (
                UserRole.ADMIN,
                UserRole.MANAGER,
            )
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.ADMIN:
            return True

        if request.user.role == UserRole.MANAGER:
            return obj.role == UserRole.MEMBER

        return False
from django.urls import path

from .views import (
    ExtensionEnrollView,
    ExtensionEnrollmentCreateView,
    ExtensionEnrollmentRevokeView,
)


urlpatterns = [
    path(
        "enrollments/",
        ExtensionEnrollmentCreateView.as_view(),
        name="extension-enrollment-create",
    ),
    path(
        "enrollments/<int:pk>/revoke/",
        ExtensionEnrollmentRevokeView.as_view(),
        name="extension-enrollment-revoke",
    ),
    path(
        "enroll/",
        ExtensionEnrollView.as_view(),
        name="extension-enroll",
    ),
]
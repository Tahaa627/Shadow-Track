from django.urls import path

from .views import (
    ExtensionEnrollView,
    ExtensionEnrollmentCreateView,
)


urlpatterns = [
    path(
        "enrollments/",
        ExtensionEnrollmentCreateView.as_view(),
        name="extension-enrollment-create",
    ),
    path(
        "enroll/",
        ExtensionEnrollView.as_view(),
        name="extension-enroll",
    ),
]
from django.urls import path

from .views import ExtensionEnrollmentCreateView


urlpatterns = [
    path(
        "enrollments/",
        ExtensionEnrollmentCreateView.as_view(),
        name="extension-enrollment-create",
    ),
]
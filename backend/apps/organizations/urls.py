from django.urls import path

from .views import (OrganizationListView,
    OrganizationUpdateView,
)


urlpatterns = [
    path(
        "",
        OrganizationListView.as_view(),
        name="organization-list",
    ),

    path(
        "<uuid:pk>/",
        OrganizationUpdateView.as_view(),
        name="organization-update",
    ),
]
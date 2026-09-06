from django.urls import path

from .views import FindingListView


urlpatterns = [
    path("", FindingListView.as_view(), name="finding-list"),
]

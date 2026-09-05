from django.urls import path

from .views import UsageEventView

urlpatterns = [
    path(
        "events/",
        UsageEventView.as_view(),
        name="usage-event",
    ),
]

from django.urls import path

from .views import (
    UsageEventView,
    SaaSUsageView,
    SaaSInventoryView,
)


urlpatterns = [
    path(
        "events/",
        UsageEventView.as_view(),
        name="usage-event",
    ),

    path(
        "saas/",
        SaaSUsageView.as_view(),
        name="saas-usage",
    ),

    path(
        "inventory/",
        SaaSInventoryView.as_view(),
        name="saas-inventory",
    ),
]
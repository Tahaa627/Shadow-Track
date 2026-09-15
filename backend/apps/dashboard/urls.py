from django.urls import path

from .views import DashboardAnomaliesView, DashboardSummaryView


urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path(
        "anomalies/",
        DashboardAnomaliesView.as_view(),
        name="dashboard-anomalies",
    ),
]

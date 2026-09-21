from django.urls import path

from .views import (
    DashboardAnomaliesView,
    DashboardReportView,
    DashboardSpendView,
    DashboardSummaryView,
)


urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path(
        "anomalies/",
        DashboardAnomaliesView.as_view(),
        name="dashboard-anomalies",
    ),
    path("spend/", DashboardSpendView.as_view(), name="dashboard-spend"),
    path("report/", DashboardReportView.as_view(), name="dashboard-report"),
]

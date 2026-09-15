from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import get_dashboard_summary
from .anomaly_service import detect_anomalies


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = getattr(request.user, "organization", None)

        if organization is None:
            return Response(
                {"detail": "Organization not found."},
                status=400,
            )

        return Response(get_dashboard_summary(organization))


class DashboardAnomaliesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = getattr(
            request.user,
            "organization",
            None,
        )

        if organization is None:
            return Response(
                {"detail": "Organization not found."},
                status=400,
            )

        anomalies = detect_anomalies(organization)

        return Response({
            "count": len(anomalies),
            "results": anomalies,
        })

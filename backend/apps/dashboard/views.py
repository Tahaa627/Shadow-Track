from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .anomaly_service import detect_anomalies
from .services import get_dashboard_summary, get_monthly_spend


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


class DashboardSpendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = getattr(request.user, "organization", None)

        if organization is None:
            return Response(
                {"detail": "User is not associated with an organization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "results": get_monthly_spend(organization),
        })

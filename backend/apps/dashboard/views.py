from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "total_spend": 4820000,
                "monthly_spend": 820000,
                "risk_score": 72,
                "shadow_saas_count": 14,
                "active_tools": 86,
                "potential_savings": 640000,
                "anomalies": 3,
            }
        )

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.organizations.models import Organization


class DashboardSummaryViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        organization = Organization.objects.create(
            name="Acme Inc",
            slug="acme-inc",
        )
        self.user = get_user_model().objects.create_user(
            email="admin@acme.test",
            password="password123",
            organization=organization,
        )

    def test_summary_requires_authentication(self):
        response = self.client.get("/api/dashboard/summary/")

        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_receives_summary(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/dashboard/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "total_spend": 4820000,
                "monthly_spend": 820000,
                "risk_score": 72,
                "shadow_saas_count": 14,
                "active_tools": 86,
                "potential_savings": 640000,
                "anomalies": 3,
            },
        )

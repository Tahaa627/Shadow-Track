from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.expenses.models import Expense
from apps.findings.models import Finding
from apps.organizations.models import Organization


class DashboardSummaryViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(
            name="Acme Inc",
            slug="acme-inc",
        )
        self.user = get_user_model().objects.create_user(
            email="admin@acme.test",
            password="password123",
            organization=self.organization,
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
                "total_spend": 0.0,
                "monthly_spend": 0.0,
                "risk_score": 0,
                "shadow_saas_count": 0,
                "active_tools": 0,
                "potential_savings": 0.0,
                "anomalies": 0,
                "high_risk_findings": 0,
            },
        )

    @patch("apps.dashboard.services.get_saas_inventory")
    def test_authenticated_user_receives_database_summary(self, get_saas_inventory):
        today = timezone.localdate()
        Expense.objects.create(
            organization=self.organization,
            vendor="Acme",
            amount="100.00",
            transaction_date=today,
        )
        Expense.objects.create(
            organization=self.organization,
            vendor="Old Acme",
            amount="50.00",
            transaction_date=today - timedelta(days=40),
        )
        Finding.objects.create(
            organization=self.organization,
            application="Unused Tool",
            finding_type=Finding.FindingType.UNUSED,
            severity=Finding.Severity.HIGH,
            potential_savings="25.00",
            recommendation="Review subscription.",
        )
        get_saas_inventory.return_value = [
            {"status": "active"},
            {"status": "shadow"},
        ]
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/dashboard/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["total_spend"], 150.0)
        self.assertEqual(response.json()["monthly_spend"], 100.0)
        self.assertEqual(response.json()["risk_score"], 25)
        self.assertEqual(response.json()["potential_savings"], 25.0)
        self.assertEqual(response.json()["high_risk_findings"], 1)

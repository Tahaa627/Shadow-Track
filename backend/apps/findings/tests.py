from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.organizations.models import Organization

from .models import Finding
from .services import refresh_findings


class FindingsTests(TestCase):
	def setUp(self):
		self.organization = Organization.objects.create(
			name="Acme",
			slug="acme",
		)
		self.user = User.objects.create_user(
			email="user@example.com",
			password="test-password",
			organization=self.organization,
		)

	@patch("apps.findings.services.get_saas_inventory")
	def test_refresh_findings_generates_savings_categories(self, get_inventory):
		get_inventory.return_value = [
			{
				"application": "Notion",
				"spend": Decimal("12000.00"),
				"users": 3,
				"sessions": 4,
				"total_hours": 0.8,
				"status": "low_usage",
			},
			{
				"application": "Microsoft 365",
				"spend": Decimal("18000.00"),
				"users": 0,
				"sessions": 0,
				"total_hours": 0,
				"status": "unverified",
			},
			{
				"application": "Canva",
				"spend": Decimal("0"),
				"users": 7,
				"sessions": 12,
				"total_hours": 4.5,
				"status": "shadow",
			},
		]

		refresh_findings(self.organization)

		findings = {
			finding.application: finding
			for finding in Finding.objects.all()
		}
		self.assertEqual(findings["Notion"].potential_savings, Decimal("6000.00"))
		self.assertEqual(findings["Notion"].finding_type, "low_usage")
		self.assertEqual(findings["Microsoft 365"].potential_savings, Decimal("18000.00"))
		self.assertEqual(findings["Microsoft 365"].finding_type, "unused")
		self.assertEqual(findings["Canva"].finding_type, "shadow_saas")

	@patch("apps.findings.services.get_saas_inventory", return_value=[])
	def test_findings_endpoint_refreshes_and_lists_organization_findings(
		self,
		get_inventory,
	):
		Finding.objects.create(
			organization=self.organization,
			application="Old finding",
			finding_type=Finding.FindingType.UNUSED,
			severity=Finding.Severity.HIGH,
			annual_spend=Decimal("100.00"),
			potential_savings=Decimal("100.00"),
			recommendation="Review it.",
		)

		client = APIClient()
		client.force_authenticate(user=self.user)
		response = client.get("/api/findings/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data, [])
		self.assertFalse(Finding.objects.exists())

# Create your tests here.

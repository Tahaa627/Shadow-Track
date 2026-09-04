from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient
from decimal import Decimal

from apps.accounts.models import User
from apps.organizations.models import Organization

from .models import Expense
from .services import normalize_vendor, process_expense_csv


CSV_CONTENT = (
	"vendor,amount,currency,transaction_date,description,employee,department\n"
	"Slack,24000,USD,2026-01-15,Annual subscription,john@example.com,Engineering\n"
	"Notion,12000,USD,2026-02-01,Team subscription,jane@example.com,Product\n"
	"Figma,8500,USD,2026-02-12,Design subscription,,Design\n"
)


class ExpenseCSVTests(TestCase):
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

	def test_process_expense_csv_creates_expenses(self):
		file = SimpleUploadedFile(
			"expenses.csv",
			CSV_CONTENT.encode("utf-8"),
			content_type="text/csv",
		)

		result = process_expense_csv(
			file,
			self.organization,
			self.user,
		)

		self.assertEqual(result["processed"], 3)
		self.assertEqual(result["failed"], 0)
		self.assertEqual(result["total_spend"], 44500)
		self.assertEqual(
			Expense.objects.filter(organization=self.organization).count(),
			3,
		)

	def test_upload_endpoint_processes_csv(self):
		client = APIClient()
		client.force_authenticate(user=self.user)
		file = SimpleUploadedFile(
			"expenses.csv",
			CSV_CONTENT.encode("utf-8"),
			content_type="text/csv",
		)

		response = client.post(
			"/api/expenses/upload/",
			{"file": file},
			format="multipart",
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data["processed"], 3)
		self.assertEqual(response.data["total_spend"], Decimal("44500"))

	def test_normalize_vendor_uses_canonical_aliases(self):
		self.assertEqual(normalize_vendor(" Slack Inc. "), "Slack")
		self.assertEqual(normalize_vendor("SLACK"), "Slack")
		self.assertEqual(normalize_vendor("Slack Technologies"), "Slack")

	def test_expense_list_returns_only_user_organization_expenses(self):
		other_organization = Organization.objects.create(
			name="Other",
			slug="other",
		)
		Expense.objects.create(
			organization=self.organization,
			vendor="Slack",
			amount=Decimal("100.00"),
			transaction_date="2026-01-15",
		)
		Expense.objects.create(
			organization=other_organization,
			vendor="Notion",
			amount=Decimal("200.00"),
			transaction_date="2026-01-15",
		)

		client = APIClient()
		client.force_authenticate(user=self.user)

		response = client.get("/api/expenses/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]["vendor"], "Slack")

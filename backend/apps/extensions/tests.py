from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.organizations.models import Organization

from .models import ExtensionEnrollment


class ExtensionAuthenticationTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.organization = Organization.objects.create(
			name="Example Org",
			slug="example-org",
		)
		self.user = get_user_model().objects.create_user(
			email="employee@example.com",
			password="secret123",
			organization=self.organization,
		)
		self.enrollment = ExtensionEnrollment.objects.create(
			organization=self.organization,
			user=self.user,
			enrollment_code="enrollment-code",
		)

	def test_enrollment_returns_raw_token_and_stores_only_hash(self):
		response = self.client.post(
			reverse("extension-enroll"),
			{"enrollment_code": self.enrollment.enrollment_code},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		token = response.data["extension_token"]
		self.assertTrue(token.startswith("sa_ext_"))

		self.enrollment.refresh_from_db()
		self.assertEqual(
			self.enrollment.extension_token_hash,
			ExtensionEnrollment.hash_token(token),
		)
		self.assertNotEqual(self.enrollment.extension_token_hash, token)

	def test_usage_event_accepts_extension_token(self):
		token = ExtensionEnrollment.generate_token()
		self.enrollment.extension_token_hash = (
			ExtensionEnrollment.hash_token(token)
		)
		self.enrollment.status = ExtensionEnrollment.Status.ACTIVE
		self.enrollment.save(
			update_fields=["extension_token_hash", "status"]
		)

		self.client.credentials(
			HTTP_AUTHORIZATION=f"Bearer {token}"
		)
		response = self.client.post(
			reverse("usage-event"),
			{
				"domain": "app.slack.com",
				"duration_seconds": "15",
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data["domain"], "app.slack.com")
		self.assertEqual(self.enrollment.usage_events.count(), 1)

	def test_usage_event_rejects_invalid_extension_token(self):
		self.client.credentials(
			HTTP_AUTHORIZATION="Bearer invalid-token"
		)

		response = self.client.post(
			reverse("usage-event"),
			{"domain": "app.slack.com"},
			format="json",
		)

		self.assertEqual(response.status_code, 401)

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
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

		self.client.force_authenticate(self.user)
		dashboard_response = self.client.get(
			reverse("extension-enrollment-create")
		)

		self.assertEqual(dashboard_response.status_code, 200)
		self.assertEqual(dashboard_response.data[0]["status"], "active")

	def test_authenticated_user_can_create_and_list_organization_enrollments(self):
		self.client.force_authenticate(self.user)

		create_response = self.client.post(
			reverse("extension-enrollment-create"),
			{},
			format="json",
		)

		self.assertEqual(create_response.status_code, 201)
		self.assertEqual(create_response.data["status"], "pending")
		self.assertIsNotNone(create_response.data["expires_at"])

		list_response = self.client.get(
			reverse("extension-enrollment-create")
		)

		self.assertEqual(list_response.status_code, 200)
		self.assertEqual(len(list_response.data), 2)

	def test_expired_enrollment_code_is_rejected(self):
		self.enrollment.expires_at = timezone.now() - timedelta(minutes=1)
		self.enrollment.save(update_fields=["expires_at"])

		response = self.client.post(
			reverse("extension-enroll"),
			{"enrollment_code": self.enrollment.enrollment_code},
			format="json",
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data["detail"], "Enrollment code has expired.")

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

	def test_authenticated_user_can_revoke_enrollment(self):
		self.client.force_authenticate(self.user)

		response = self.client.post(
			reverse(
				"extension-enrollment-revoke",
				kwargs={"pk": self.enrollment.pk},
			)
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["status"], "revoked")
		self.enrollment.refresh_from_db()
		self.assertEqual(
			self.enrollment.status,
			ExtensionEnrollment.Status.REVOKED,
		)

		# Second attempt should return 400
		repeat_response = self.client.post(
			reverse(
				"extension-enrollment-revoke",
				kwargs={"pk": self.enrollment.pk},
			)
		)
		self.assertEqual(repeat_response.status_code, 400)

	def test_revoked_token_is_rejected_in_usage_events(self):
		token = ExtensionEnrollment.generate_token()
		self.enrollment.extension_token_hash = (
			ExtensionEnrollment.hash_token(token)
		)
		self.enrollment.status = ExtensionEnrollment.Status.ACTIVE
		self.enrollment.save(
			update_fields=["extension_token_hash", "status"]
		)

		# Revoke enrollment
		self.client.force_authenticate(self.user)
		revoke_response = self.client.post(
			reverse(
				"extension-enrollment-revoke",
				kwargs={"pk": self.enrollment.pk},
			)
		)
		self.assertEqual(revoke_response.status_code, 200)

		# Clear forced session authentication so Bearer token authentication runs
		self.client.force_authenticate(user=None)

		# Usage event using the token should now be rejected
		self.client.credentials(
			HTTP_AUTHORIZATION=f"Bearer {token}"
		)
		response = self.client.post(
			reverse("usage-event"),
			{"domain": "app.slack.com"},
			format="json",
		)
		self.assertEqual(response.status_code, 401)

	def test_cannot_revoke_enrollment_from_another_organization(self):
		other_org = Organization.objects.create(
			name="Other Org",
			slug="other-org",
		)
		other_user = get_user_model().objects.create_user(
			email="stranger@other.test",
			password="secret123",
			organization=other_org,
		)

		self.client.force_authenticate(other_user)
		response = self.client.post(
			reverse(
				"extension-enrollment-revoke",
				kwargs={"pk": self.enrollment.pk},
			)
		)
		self.assertEqual(response.status_code, 404)

	def test_end_to_end_dashboard_to_extension_lifecycle(self):
		"""
		Complete End-to-End lifecycle test:
		1. Dashboard generates a new enrollment code.
		2. Dashboard lists enrollment as 'pending' with null last_seen.
		3. Chrome extension connects using the enrollment code.
		4. Extension receives raw token, server hashes token with SHA-256.
		5. Dashboard status polling detects transition to 'active'.
		6. Extension reports domain telemetry event.
		7. Server updates last_seen timestamp on enrollment.
		8. Dashboard poll reflects updated last_seen timestamp.
		9. Dashboard revokes the device enrollment.
		10. Extension telemetry is immediately rejected with HTTP 401 Unauthorized.
		"""
		# 1. Admin generates enrollment code on Dashboard
		self.client.force_authenticate(self.user)
		gen_res = self.client.post(
			reverse("extension-enrollment-create"),
			{},
			format="json",
		)
		self.assertEqual(gen_res.status_code, 201)
		code = gen_res.data["enrollment_code"]
		enrollment_id = gen_res.data["id"]
		self.assertEqual(gen_res.data["status"], "pending")
		self.assertIsNone(gen_res.data["last_seen"])

		# 2. Dashboard lists enrollments
		list_res = self.client.get(reverse("extension-enrollment-create"))
		self.assertEqual(list_res.status_code, 200)
		dashboard_item = next(
			item for item in list_res.data if item["id"] == enrollment_id
		)
		self.assertEqual(dashboard_item["status"], "pending")

		# 3. Chrome extension connects using the enrollment code (unauthenticated public endpoint)
		self.client.force_authenticate(user=None)
		enroll_res = self.client.post(
			reverse("extension-enroll"),
			{"enrollment_code": code},
			format="json",
		)
		self.assertEqual(enroll_res.status_code, 200)
		self.assertEqual(enroll_res.data["status"], "active")
		raw_token = enroll_res.data["extension_token"]
		self.assertTrue(raw_token.startswith("sa_ext_"))

		# 4. Verify DB stores only SHA-256 hash
		db_enrollment = ExtensionEnrollment.objects.get(pk=enrollment_id)
		self.assertEqual(db_enrollment.status, ExtensionEnrollment.Status.ACTIVE)
		self.assertEqual(
			db_enrollment.extension_token_hash,
			ExtensionEnrollment.hash_token(raw_token),
		)

		# 5. Dashboard status polling detects transition to 'active'
		self.client.force_authenticate(self.user)
		poll_res = self.client.get(reverse("extension-enrollment-create"))
		dashboard_item_active = next(
			item for item in poll_res.data if item["id"] == enrollment_id
		)
		self.assertEqual(dashboard_item_active["status"], "active")

		# 6. Extension reports domain telemetry event
		self.client.force_authenticate(user=None)
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {raw_token}")
		usage_res = self.client.post(
			reverse("usage-event"),
			{
				"domain": "notion.so",
				"duration_seconds": 120,
			},
			format="json",
		)
		self.assertEqual(usage_res.status_code, 201)

		# 7 & 8. Verify last_seen updated on server and visible in Dashboard
		self.client.credentials()  # Clear credentials
		self.client.force_authenticate(self.user)
		poll_after_usage = self.client.get(reverse("extension-enrollment-create"))
		dashboard_item_updated = next(
			item for item in poll_after_usage.data if item["id"] == enrollment_id
		)
		self.assertIsNotNone(dashboard_item_updated["last_seen"])

		# 9. Dashboard revokes the device enrollment
		revoke_res = self.client.post(
			reverse(
				"extension-enrollment-revoke",
				kwargs={"pk": enrollment_id},
			)
		)
		self.assertEqual(revoke_res.status_code, 200)
		self.assertEqual(revoke_res.data["status"], "revoked")

		# 10. Extension telemetry is rejected with HTTP 401 Unauthorized
		self.client.force_authenticate(user=None)
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {raw_token}")
		rejected_res = self.client.post(
			reverse("usage-event"),
			{
				"domain": "github.com",
				"duration_seconds": 30,
			},
			format="json",
		)
		self.assertEqual(rejected_res.status_code, 401)


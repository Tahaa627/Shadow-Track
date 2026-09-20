from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.organizations.models import Organization

from .models import AuditEvent
from .services import record_audit_event


class AuditEventTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.request_factory = RequestFactory()
        self.user_model = get_user_model()
        self.organization = Organization.objects.create(
            name="Example Org",
            slug="example-org",
        )
        self.admin = self.user_model.objects.create_user(
            email="admin@example.com",
            password="secret123",
            organization=self.organization,
            role="ADMIN",
        )
        self.member = self.user_model.objects.create_user(
            email="member@example.com",
            password="secret123",
            organization=self.organization,
        )

    def test_record_audit_event_stores_request_context_and_target(self):
        request = self.request_factory.get(
            "/api/compliance/audit-events/",
            REMOTE_ADDR="192.0.2.1",
            HTTP_USER_AGENT="test-agent",
        )

        event = record_audit_event(
            organization=self.organization,
            actor=self.admin,
            action="organization.updated",
            target=self.organization,
            metadata={"changed": ["name"]},
            request=request,
        )

        self.assertEqual(event.actor, self.admin)
        self.assertEqual(event.target_type, "Organization")
        self.assertEqual(event.target_id, str(self.organization.pk))
        self.assertEqual(event.ip_address, "192.0.2.1")
        self.assertEqual(event.user_agent, "test-agent")

    def test_audit_events_are_append_only(self):
        event = AuditEvent.objects.create(
            organization=self.organization,
            action="auth.login",
        )

        event.action = "changed"
        with self.assertRaises(ValueError):
            event.save()

    def test_only_admin_can_list_organization_audit_events(self):
        AuditEvent.objects.create(
            organization=self.organization,
            actor=self.admin,
            action="auth.login",
        )

        self.client.force_authenticate(self.member)
        member_response = self.client.get(reverse("audit-event-list"))
        self.assertEqual(member_response.status_code, 403)

        self.client.force_authenticate(self.admin)
        admin_response = self.client.get(reverse("audit-event-list"))
        self.assertEqual(admin_response.status_code, 200)
        self.assertEqual(len(admin_response.data), 1)
        self.assertEqual(admin_response.data[0]["action"], "auth.login")

    def test_audit_event_list_is_organization_scoped(self):
        other_organization = Organization.objects.create(
            name="Other Org",
            slug="other-org",
        )
        other_admin = self.user_model.objects.create_user(
            email="other-admin@example.com",
            password="secret123",
            organization=other_organization,
            role="ADMIN",
        )
        AuditEvent.objects.create(
            organization=self.organization,
            action="auth.login",
        )
        AuditEvent.objects.create(
            organization=other_organization,
            action="auth.login",
        )

        self.client.force_authenticate(other_admin)
        response = self.client.get(reverse("audit-event-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["action"], "auth.login")

    def test_login_creates_audit_event(self):
        response = self.client.post(
            reverse("login"),
            {"email": self.admin.email, "password": "secret123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            AuditEvent.objects.filter(
                organization=self.organization,
                actor=self.admin,
                action="auth.login",
            ).exists()
        )

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.organizations.models import Organization


class AuthFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_model = get_user_model()

    def test_register_endpoint_creates_user_and_tokens(self):
        payload = {
            "organization_name": "Example Org",
            "organization_slug": "example-org",
            "email": "register@example.com",
            "password": "secret123",
            "first_name": "Jane",
            "last_name": "Doe",
        }

        response = self.client.post(
            reverse("register"),
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["email"], payload["email"])
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])

    def test_register_rejects_existing_email(self):
        organization = Organization.objects.create(
            name="Existing Org",
            slug="existing-org",
        )

        self.user_model.objects.create_user(
            email="duplicate@example.com",
            password="secret123",
            organization=organization,
        )

        response = self.client.post(
            reverse("register"),
            {
                "organization_name": "New Org",
                "organization_slug": "new-org",
                "email": "duplicate@example.com",
                "password": "secret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("A user with this email already exists.", str(response.data))

    def test_login_endpoint_accepts_email_for_authentication(self):
        organization = Organization.objects.create(
            name="Login Org",
            slug="login-org",
        )

        self.user_model.objects.create_user(
            email="login@example.com",
            password="secret123",
            organization=organization,
            first_name="Login",
            last_name="User",
        )

        response = self.client.post(
            reverse("login"),
            {"email": "login@example.com", "password": "secret123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_credentials_with_standard_message(self):
        organization = Organization.objects.create(
            name="Invalid Org",
            slug="invalid-org",
        )

        self.user_model.objects.create_user(
            email="valid@example.com",
            password="correct-pass",
            organization=organization,
        )

        response = self.client.post(
            reverse("login"),
            {"email": "valid@example.com", "password": "wrong-pass"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn(
            "No active account found with the given credentials.",
            str(response.data),
        )

        missing_user_response = self.client.post(
            reverse("login"),
            {"email": "missing@example.com", "password": "wrong-pass"},
            format="json",
        )

        self.assertEqual(missing_user_response.status_code, 400)
        self.assertIn(
            "No active account found with the given credentials.",
            str(missing_user_response.data),
        )

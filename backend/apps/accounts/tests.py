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

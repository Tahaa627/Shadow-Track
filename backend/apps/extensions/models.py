import hashlib
import secrets

from django.conf import settings
from django.db import models


class ExtensionEnrollment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        REVOKED = "revoked", "Revoked"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="extension_enrollments",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="extension_enrollments",
    )

    enrollment_code = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
    )

    extension_token_hash = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    enrolled_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    last_seen = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.status}"

    @staticmethod
    def generate_code():
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_token():
        return "sa_ext_" + secrets.token_urlsafe(48)

    @staticmethod
    def hash_token(token):
        return hashlib.sha256(token.encode("utf-8")).hexdigest()
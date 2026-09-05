from django.conf import settings
from django.db import models


class UsageEvent(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="usage_events",
    )

    enrollment = models.ForeignKey(
        "extensions.ExtensionEnrollment",
        on_delete=models.CASCADE,
        related_name="usage_events",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="usage_events",
    )

    domain = models.CharField(max_length=255)

    application = models.CharField(
        max_length=255,
        blank=True,
    )

    event_type = models.CharField(
        max_length=50,
        default="active_tab",
    )

    occurred_at = models.DateTimeField()

    duration_seconds = models.PositiveIntegerField(
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-occurred_at"]

        indexes = [
            models.Index(
                fields=[
                    "organization",
                    "domain",
                    "occurred_at",
                ]
            ),
            models.Index(
                fields=[
                    "enrollment",
                    "occurred_at",
                ]
            ),
        ]

    def __str__(self):
        return f"{self.domain} - {self.user.email}"

from rest_framework import serializers

from .models import ExtensionEnrollment


class ExtensionEnrollmentSerializer(
    serializers.ModelSerializer
):
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = ExtensionEnrollment
        fields = [
            "id",
            "enrollment_code",
            "status",
            "user_email",
            "enrolled_at",
            "last_seen",
            "created_at",
            "expires_at",
        ]
        read_only_fields = fields
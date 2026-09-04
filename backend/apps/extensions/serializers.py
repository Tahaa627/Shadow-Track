from rest_framework import serializers

from .models import ExtensionEnrollment


class ExtensionEnrollmentSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ExtensionEnrollment
        fields = [
            "id",
            "enrollment_code",
            "status",
            "enrolled_at",
            "last_seen",
            "created_at",
        ]
        read_only_fields = fields
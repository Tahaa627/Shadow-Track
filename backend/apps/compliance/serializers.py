from rest_framework import serializers

from .models import AuditEvent


class AuditEventSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True)

    class Meta:
        model = AuditEvent
        fields = (
            "id",
            "action",
            "actor_email",
            "target_type",
            "target_id",
            "metadata",
            "ip_address",
            "user_agent",
            "created_at",
        )

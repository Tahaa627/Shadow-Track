from rest_framework import serializers

from .models import UsageEvent


class UsageEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageEvent
        fields = [
            "id",
            "domain",
            "application",
            "event_type",
            "occurred_at",
            "duration_seconds",
        ]
        read_only_fields = [
            "id",
            "application",
        ]

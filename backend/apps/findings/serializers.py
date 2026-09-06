from rest_framework import serializers

from .models import Finding


class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = [
            "id",
            "application",
            "finding_type",
            "severity",
            "annual_spend",
            "potential_savings",
            "evidence",
            "recommendation",
            "created_at",
        ]

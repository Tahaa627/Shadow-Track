from rest_framework import serializers

from .models import Organization

'''
Organization Serializer: Serializes Organization model instances for API responses.
'''
class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        # model specifies the model to be serialized, which is the Organization model.
        model = Organization
        # fields specifies the fields to be included in the serialized representation of the Organization model.
        fields = (
            "id",
            "name",
            "slug",
            "is_active",
            "created_at",
            "updated_at",
        )
        # read_only_fields specifies the fields that should be read-only in the serialized representation of Organization model.
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )
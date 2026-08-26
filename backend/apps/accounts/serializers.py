from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "organization",
            "role",
            "is_active",
            "created_at",
        )
        read_only_fields = (
            "id",
            "role",
            "is_active",
            "created_at",
        )

from django.db import transaction
from rest_framework import serializers

from apps.organizations.models import Organization

from .models import User, UserRole


class RegisterSerializer(serializers.Serializer):
    organization_name = serializers.CharField(max_length=255)
    organization_slug = serializers.SlugField(max_length=255)

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )
    first_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    last_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_organization_slug(self, value):
        if Organization.objects.filter(slug=value).exists():
            raise serializers.ValidationError(
                "This organization slug is already in use."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):
        organization = Organization.objects.create(
            name=validated_data["organization_name"],
            slug=validated_data["organization_slug"],
        )

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            organization=organization,
            role=UserRole.ADMIN,
            is_active=True,
        )

        return user
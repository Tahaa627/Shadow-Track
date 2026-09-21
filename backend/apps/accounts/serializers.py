from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.organizations.models import Organization
from apps.organizations.serializers import OrganizationSerializer

from .models import User, UserRole
from .services import register_user
from apps.compliance.services import record_audit_event

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError({
                "detail": "Email and password are required."
            })

        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if user is None or not user.is_active:
            raise serializers.ValidationError({
                "detail": "No active account found with the given credentials."
            })

        data = super().validate({"email": user.email, "password": password})
        if user.organization_id:
            record_audit_event(
                organization=user.organization,
                actor=user,
                action="auth.login",
                request=self.context.get("request"),
            )
        return data


class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

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
            "updated_at",
        )

        read_only_fields = (
            "id",
            "organization",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        )
        


class UserCreateSerializer(serializers.Serializer):

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

    role = serializers.ChoiceField(
        choices=UserRole.choices,
        default=UserRole.MEMBER,
    )

    def validate_email(self, value):
        if User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_role(self, value):
        request = self.context["request"]
    
        if (
            request.user.role == UserRole.MANAGER
            and value != UserRole.MEMBER
        ):
            raise serializers.ValidationError(
                "Managers can only create members."
            )
    
        return value


class RegisterSerializer(serializers.Serializer):

    organization_name = serializers.CharField(
        max_length=255
    )

    organization_slug = serializers.SlugField(
        max_length=255
    )

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
        if User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_organization_slug(self, value):
        if Organization.objects.filter(
            slug=value
        ).exists():
            raise serializers.ValidationError(
                "This organization slug is already in use."
            )

        return value

    def create(self, validated_data):
        user = register_user(
            **validated_data
        )
        record_audit_event(
            organization=user.organization,
            actor=user,
            action="auth.register",
            request=self.context.get("request"),
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )
    new_password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
        allow_blank=True,
    )

    class Meta:
        model = User

        fields = (
            "email",
            "first_name",
            "last_name",
            "current_password",
            "new_password",
        )

    def validate(self, attrs):
        new_password = attrs.get("new_password")
        current_password = attrs.get("current_password")

        if new_password:
            if not current_password:
                raise serializers.ValidationError({
                    "current_password": "Current password is required to change your password.",
                })

            if not self.instance.check_password(current_password):
                raise serializers.ValidationError({
                    "current_password": "Current password is incorrect.",
                })

            attrs.pop("current_password", None)

        return attrs

    def validate_email(self, value):
        user = self.instance

        if User.objects.filter(
            email__iexact=value
        ).exclude(
            id=user.id
        ).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def update(self, instance, validated_data):
        update_fields = []

        for field in ("email", "first_name", "last_name"):
            value = validated_data.get(field)
            if value is not None:
                setattr(instance, field, value)
                update_fields.append(field)

        if validated_data.get("new_password"):
            instance.set_password(validated_data["new_password"])
            update_fields.append("password")

        if update_fields:
            update_fields.append("updated_at")

        instance.save(update_fields=update_fields)

        return instance
from rest_framework import serializers

from apps.organizations.models import Organization

from .models import User, UserRole


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
        return register_user(
            **validated_data
        )

class UserUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "email",
            "first_name",
            "last_name",
            "role",
        )

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
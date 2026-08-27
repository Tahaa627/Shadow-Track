from django.db import transaction

from apps.organizations.models import Organization

from .models import User, UserRole


@transaction.atomic
def register_user(
    *,
    organization_name: str,
    organization_slug: str,
    email: str,
    password: str,
    first_name: str = "",
    last_name: str = "",
) -> User:

    organization = Organization.objects.create(
        name=organization_name,
        slug=organization_slug,
    )

    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        organization=organization,
        role=UserRole.ADMIN,
        is_active=True,
    )

    return user
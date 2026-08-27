from django.db.models import QuerySet

from .models import User


def get_user_by_id(
    *,
    user_id,
) -> User | None:
    return User.objects.filter(
        id=user_id
    ).first()


def get_user_by_email(
    *,
    email: str,
) -> User | None:
    return User.objects.filter(
        email__iexact=email
    ).first()


def get_organization_users(
    *,
    organization_id,
) -> QuerySet[User]:
    return User.objects.filter(
        organization_id=organization_id,
        is_active=True,
    ).order_by("email")
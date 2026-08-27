from django.db import transaction

from .models import User, UserRole


@transaction.atomic
def create_user(
    *,
    email: str,
    password: str,
    organization,
    role: str = UserRole.MEMBER,
    first_name: str = "",
    last_name: str = "",
) -> User:
    return User.objects.create_user(
        email=email,
        password=password,
        organization=organization,
        role=role,
        first_name=first_name,
        last_name=last_name,
        is_active=True,
    )


@transaction.atomic
def update_user(
    *,
    user: User,
    email: str | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
    role: str | None = None,
) -> User:

    update_fields = []

    if email is not None:
        user.email = email
        update_fields.append("email")

    if first_name is not None:
        user.first_name = first_name
        update_fields.append("first_name")

    if last_name is not None:
        user.last_name = last_name
        update_fields.append("last_name")

    if role is not None:
        user.role = role
        update_fields.append("role")

    if update_fields:
        update_fields.append("updated_at")

        user.save(
            update_fields=update_fields
        )

    return user


@transaction.atomic
def deactivate_user(
    *,
    user: User,
) -> User:

    user.is_active = False

    user.save(
        update_fields=[
            "is_active",
            "updated_at",
        ]
    )

    return user
from django.db import transaction

from .models import Organization


@transaction.atomic
def update_organization(
    *,
    organization: Organization,
    name: str | None = None,
    is_active: bool | None = None,
) -> Organization:

    if name is not None:
        organization.name = name

    if is_active is not None:
        organization.is_active = is_active

    organization.save(
        update_fields=[
            "name",
            "is_active",
            "updated_at",
        ]
    )

    return organization
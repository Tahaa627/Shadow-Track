from django.db.models import QuerySet

from .models import Organization


def get_organization_by_id(
    *,
    organization_id,
) -> Organization:
    return Organization.objects.get(
        id=organization_id
    )


def get_user_organizations(
    *,
    user,
) -> QuerySet[Organization]:
    return Organization.objects.filter(
        users=user
    ).distinct()
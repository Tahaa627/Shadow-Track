from django.db.models import QuerySet

from .models import Organization
'''
Selectors for the Organization model: Provides functions to retrieve organization data from the database.
QuerySet is a Django class that represents a collection of database queries. It allows for filtering,
ordering, and other operations on the data.
-> functions in this file are used to retrieve organization data from the database using QuerySet methods.
'''
'''
get_organization_by_id: Retrieves an organization instance by its unique identifier (UUID).
Parameters: 
    organization_id (UUID): The unique identifier of the organization to retrieve.
Returns:
    Organization: The organization instance with the specified ID.
'''
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
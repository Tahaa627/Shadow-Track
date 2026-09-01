import uuid

from django.db import models


class Organization(models.Model):
    # UUID Field is used to create unique identifier key which is used as primary key for the organization model. 
    # It is generated using the uuid4() function from the uuid module, which generates a random UUID.
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    name = models.CharField(max_length=255)
    # The slug field is a unique identifier for the organization that is generated from the name field.
    slug = models.SlugField(
        max_length=255,
        unique=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        '''
        Meta class is used to define the database table name and ordering for the Organization model.
        '''
        # Define the database table name
        db_table = "organizations"

        # Define the default ordering for the Organization model
        ordering = ["name"]

    def __str__(self):
        return self.name
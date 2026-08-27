from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .permissions import IsAdminOrManager
from .selectors import get_user_organizations
from .serializers import OrganizationSerializer
from .services import update_organization


class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_user_organizations(
            user=self.request.user
        )


class OrganizationUpdateView(generics.UpdateAPIView):
    serializer_class = OrganizationSerializer

    def get_permissions(self):
        return [
            IsAuthenticated(),
            IsAdminOrManager(),
        ]

    def get_queryset(self):
        return get_user_organizations(
            user=self.request.user
        )

    def perform_update(self, serializer):
        update_organization(
            organization=serializer.instance,
            **serializer.validated_data,
        )
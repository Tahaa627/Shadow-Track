

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Organization
from .permissions import IsAdminOrManager
from .serializers import OrganizationSerializer


class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return Organization.objects.filter(
            users=self.request.user
        ).distinct()

    def get_permissions(self):
        if self.request.method == "POST":
            return [
                IsAuthenticated(),
                IsAdminOrManager(),
            ]

        return [
            IsAuthenticated(),
        ]


class OrganizationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return Organization.objects.filter(
            users=self.request.user
        ).distinct()

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [
                IsAuthenticated(),
                IsAdminOrManager(),
            ]

        return [
            IsAuthenticated(),
        ]
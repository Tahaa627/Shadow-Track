from rest_framework import generics

from apps.accounts.permissions import IsAdmin

from .models import AuditEvent
from .serializers import AuditEventSerializer


class AuditEventListView(generics.ListAPIView):
    serializer_class = AuditEventSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = AuditEvent.objects.filter(
            organization_id=self.request.user.organization_id,
        ).select_related("actor")

        action = self.request.query_params.get("action")
        if action:
            queryset = queryset.filter(action=action)

        return queryset[:100]

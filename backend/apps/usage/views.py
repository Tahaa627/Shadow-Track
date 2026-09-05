from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.extensions.authentication import (
    ExtensionTokenAuthentication,
)

from .models import UsageEvent
from .services import identify_application


class UsageEventView(APIView):
    authentication_classes = [ExtensionTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        enrollment = request.auth
        domain = request.data.get("domain")
        occurred_at = request.data.get("occurred_at")
        duration_seconds = request.data.get(
            "duration_seconds",
            0,
        )

        if not domain:
            return Response(
                {"detail": "domain is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            duration_seconds = int(duration_seconds)
        except (TypeError, ValueError):
            duration_seconds = 0

        application = identify_application(domain)

        event = UsageEvent.objects.create(
            organization=enrollment.organization,
            enrollment=enrollment,
            user=enrollment.user,
            domain=domain,
            application=application,
            event_type="active_tab",
            occurred_at=occurred_at or timezone.now(),
            duration_seconds=max(duration_seconds, 0),
        )

        enrollment.last_seen = timezone.now()
        enrollment.save(update_fields=["last_seen"])

        return Response(
            {
                "id": event.id,
                "domain": event.domain,
                "application": event.application,
                "status": "recorded",
            },
            status=status.HTTP_201_CREATED,
        )

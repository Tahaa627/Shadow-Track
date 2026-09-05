from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.extensions.models import ExtensionEnrollment

from .models import UsageEvent
from .services import identify_application


class UsageEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        enrollment_id = request.data.get("enrollment_id")
        domain = request.data.get("domain")
        occurred_at = request.data.get("occurred_at")
        duration_seconds = request.data.get(
            "duration_seconds",
            0,
        )

        if not enrollment_id:
            return Response(
                {"detail": "enrollment_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not domain:
            return Response(
                {"detail": "domain is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            enrollment = (
                ExtensionEnrollment.objects
                .select_related("organization")
                .get(
                    id=enrollment_id,
                    status=ExtensionEnrollment.Status.ACTIVE,
                    user=request.user,
                )
            )
        except ExtensionEnrollment.DoesNotExist:
            return Response(
                {"detail": "Invalid extension enrollment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        application = identify_application(domain)

        event = UsageEvent.objects.create(
            organization=enrollment.organization,
            enrollment=enrollment,
            user=request.user,
            domain=domain,
            application=application,
            event_type="active_tab",
            occurred_at=occurred_at or timezone.now(),
            duration_seconds=duration_seconds,
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

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ExtensionEnrollment
from .serializers import ExtensionEnrollmentSerializer


class ExtensionEnrollmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        organization = getattr(
            request.user,
            "organization",
            None,
        )

        if organization is None:
            return Response(
                {
                    "detail": (
                        "User is not associated with "
                        "an organization."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollment = ExtensionEnrollment.objects.create(
            organization=organization,
            user=request.user,
            enrollment_code=(
                ExtensionEnrollment.generate_code()
            ),
        )

        serializer = ExtensionEnrollmentSerializer(
            enrollment
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ExtensionEnrollView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get("enrollment_code")

        if not code:
            return Response(
                {"detail": "Enrollment code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            enrollment = ExtensionEnrollment.objects.select_related(
                "organization",
                "user",
            ).get(
                enrollment_code=code,
                status=ExtensionEnrollment.Status.PENDING,
            )
        except ExtensionEnrollment.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired enrollment code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        extension_token = ExtensionEnrollment.generate_token()
        enrollment.extension_token_hash = (
            ExtensionEnrollment.hash_token(extension_token)
        )
        enrollment.status = ExtensionEnrollment.Status.ACTIVE
        enrollment.enrolled_at = now
        enrollment.last_seen = now
        enrollment.save(
            update_fields=[
                "extension_token_hash",
                "status",
                "enrolled_at",
                "last_seen",
            ]
        )

        return Response(
            {
                "status": "active",
                "enrollment_id": enrollment.id,
                "organization_id": str(enrollment.organization_id),
                "extension_token": extension_token,
            },
            status=status.HTTP_200_OK,
        )
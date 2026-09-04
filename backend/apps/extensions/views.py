from rest_framework import status
from rest_framework.permissions import IsAuthenticated
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
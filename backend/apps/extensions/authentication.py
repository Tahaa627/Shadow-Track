import hashlib

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import ExtensionEnrollment


class ExtensionTokenAuthentication(BaseAuthentication):
    def authenticate_header(self, request):
        return "Bearer"

    def authenticate(self, request):
        header = request.headers.get("Authorization")

        if not header:
            return None

        parts = header.split()

        if len(parts) != 2:
            return None

        scheme, token = parts

        if scheme.lower() != "bearer":
            return None

        token_hash = hashlib.sha256(
            token.encode("utf-8")
        ).hexdigest()

        try:
            enrollment = (
                ExtensionEnrollment.objects
                .select_related("organization", "user")
                .get(
                    extension_token_hash=token_hash,
                    status=ExtensionEnrollment.Status.ACTIVE,
                )
            )
        except ExtensionEnrollment.DoesNotExist as exc:
            raise AuthenticationFailed(
                "Invalid extension token."
            ) from exc

        return enrollment.user, enrollment
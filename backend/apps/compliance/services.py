from apps.organizations.models import Organization

from .models import AuditEvent


def record_audit_event(
    *,
    organization: Organization,
    action: str,
    actor=None,
    target=None,
    metadata=None,
    request=None,
) -> AuditEvent:
    return AuditEvent.objects.create(
        organization=organization,
        actor=actor,
        action=action,
        target_type=target.__class__.__name__ if target else "",
        target_id=str(target.pk) if target else "",
        metadata=metadata or {},
        ip_address=(
            request.META.get("REMOTE_ADDR")
            if request is not None
            else None
        ),
        user_agent=(
            request.META.get("HTTP_USER_AGENT", "")
            if request is not None
            else ""
        ),
    )

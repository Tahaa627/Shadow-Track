from django.contrib import admin

from .models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "organization", "action", "actor")
    list_filter = ("action", "organization")
    readonly_fields = [field.name for field in AuditEvent._meta.fields]

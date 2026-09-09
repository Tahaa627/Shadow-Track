from django.contrib import admin

from .models import ExtensionEnrollment


@admin.register(ExtensionEnrollment)
class ExtensionEnrollmentAdmin(admin.ModelAdmin):
	list_display = (
		"id",
		"user",
		"organization",
		"status",
		"enrolled_at",
		"last_seen",
		"created_at",
		"expires_at",
	)
	list_filter = ("status", "organization")
	search_fields = ("user__email", "enrollment_code")
	readonly_fields = (
		"enrollment_code",
		"extension_token_hash",
		"created_at",
		"enrolled_at",
		"last_seen",
	)

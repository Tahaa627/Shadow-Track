from django.contrib import admin

from .models import Finding


@admin.register(Finding)
class FindingAdmin(admin.ModelAdmin):
	list_display = (
		"application",
		"finding_type",
		"severity",
		"annual_spend",
		"potential_savings",
		"organization",
	)
	list_filter = ("finding_type", "severity", "organization")

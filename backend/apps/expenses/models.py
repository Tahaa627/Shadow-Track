from django.conf import settings
from django.db import models


class Expense(models.Model):
	class Source(models.TextChoices):
		CSV = "csv", "CSV"
		MANUAL = "manual", "Manual"
		INTEGRATION = "integration", "Integration"

	organization = models.ForeignKey(
		"organizations.Organization",
		on_delete=models.CASCADE,
		related_name="expenses",
	)

	vendor = models.CharField(max_length=255)
	amount = models.DecimalField(max_digits=14, decimal_places=2)
	currency = models.CharField(max_length=3, default="USD")
	transaction_date = models.DateField()
	description = models.TextField(blank=True)
	employee = models.CharField(max_length=255, blank=True)
	department = models.CharField(max_length=255, blank=True)
	source = models.CharField(
		max_length=20,
		choices=Source.choices,
		default=Source.CSV,
	)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="created_expenses",
	)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-transaction_date", "-created_at"]
		indexes = [
			models.Index(fields=["organization", "transaction_date"]),
			models.Index(fields=["organization", "vendor"]),
		]

	def __str__(self):
		return f"{self.vendor} - {self.amount} {self.currency}"

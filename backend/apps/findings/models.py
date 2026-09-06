from django.db import models


class Finding(models.Model):
	class FindingType(models.TextChoices):
		UNUSED = "unused", "Unused"
		LOW_USAGE = "low_usage", "Low Usage"
		SHADOW_SAAS = "shadow_saas", "Shadow SaaS"
		REDUNDANT = "redundant", "Redundant"

	class Severity(models.TextChoices):
		LOW = "low", "Low"
		MEDIUM = "medium", "Medium"
		HIGH = "high", "High"

	organization = models.ForeignKey(
		"organizations.Organization",
		on_delete=models.CASCADE,
		related_name="findings",
	)
	application = models.CharField(max_length=255)
	finding_type = models.CharField(max_length=30, choices=FindingType.choices)
	severity = models.CharField(max_length=20, choices=Severity.choices)
	annual_spend = models.DecimalField(max_digits=14, decimal_places=2, default=0)
	potential_savings = models.DecimalField(
		max_digits=14,
		decimal_places=2,
		default=0,
	)
	evidence = models.JSONField(default=dict)
	recommendation = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-potential_savings", "-created_at"]
		indexes = [
			models.Index(fields=["organization", "finding_type"]),
			models.Index(fields=["organization", "severity"]),
		]

	def __str__(self):
		return f"{self.application} - {self.finding_type}"

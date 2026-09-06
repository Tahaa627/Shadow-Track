from decimal import Decimal

from django.db import transaction

from apps.usage.services import get_saas_inventory

from .models import Finding


LOW_USAGE_SAVINGS_RATE = Decimal("0.50")
UNUSED_SAVINGS_RATE = Decimal("1.00")


def generate_savings_findings(organization):
    inventory = get_saas_inventory(organization)
    findings = []

    for item in inventory:
        application = item["application"]
        spend = item["spend"]
        users = item["users"]
        total_hours = item["total_hours"]
        status = item["status"]
        evidence = {
            "users": users,
            "sessions": item["sessions"],
            "usage_hours": total_hours,
        }

        if spend == 0 and users > 0:
            findings.append({
                "application": application,
                "finding_type": Finding.FindingType.SHADOW_SAAS,
                "severity": Finding.Severity.MEDIUM,
                "annual_spend": Decimal("0"),
                "potential_savings": Decimal("0"),
                "evidence": evidence,
                "recommendation": (
                    f"Review {application} usage and determine whether "
                    "it should be formally approved."
                ),
            })
        elif spend > 0 and users == 0:
            findings.append({
                "application": application,
                "finding_type": Finding.FindingType.UNUSED,
                "severity": Finding.Severity.HIGH,
                "annual_spend": spend,
                "potential_savings": spend * UNUSED_SAVINGS_RATE,
                "evidence": evidence,
                "recommendation": (
                    f"Review the {application} subscription for cancellation "
                    "or license reduction."
                ),
            })
        elif spend > 0 and status == "low_usage":
            findings.append({
                "application": application,
                "finding_type": Finding.FindingType.LOW_USAGE,
                "severity": Finding.Severity.MEDIUM,
                "annual_spend": spend,
                "potential_savings": spend * LOW_USAGE_SAVINGS_RATE,
                "evidence": evidence,
                "recommendation": (
                    f"Review {application} licenses and consider reducing "
                    "unused or underutilized seats."
                ),
            })

    return findings


@transaction.atomic
def refresh_findings(organization):
    Finding.objects.filter(organization=organization).delete()
    generated = generate_savings_findings(organization)
    findings = [Finding(organization=organization, **item) for item in generated]
    Finding.objects.bulk_create(findings)
    return findings

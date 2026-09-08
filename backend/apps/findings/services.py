from decimal import Decimal

from django.db import transaction

from apps.usage.services import get_saas_inventory

from .models import Finding


LOW_USAGE_SAVINGS_RATE = Decimal("0.50")
UNUSED_SAVINGS_RATE = Decimal("1.00")

REDUNDANCY_GROUPS = (
    frozenset(("Miro", "Lucidchart", "FigJam")),
    frozenset(("Airtable", "Smartsheet", "Notion")),
    frozenset(("Calendly", "Google Calendar")),
)


def generate_findings(organization):
    return generate_savings_findings_from_inventory(
        get_saas_inventory(organization),
    )


def generate_savings_findings(organization):
    """Backward-compatible alias for the findings generator."""
    return generate_findings(organization)


def generate_savings_findings_from_inventory(inventory):
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


def generate_redundancy_findings(inventory):
    """Find paid applications that overlap with a higher-spend tool."""
    by_application = {
        item["application"].casefold(): item
        for item in inventory
    }
    findings = []

    for group in REDUNDANCY_GROUPS:
        applications = [
            by_application[name.casefold()]
            for name in group
            if name.casefold() in by_application
        ]
        paid_applications = [
            item for item in applications if item["spend"] > 0
        ]

        if len(paid_applications) < 2:
            continue

        primary = max(
            paid_applications,
            key=lambda item: (item["spend"], item["application"].casefold()),
        )
        overlapping = [
            item for item in paid_applications if item is not primary
        ]
        overlap_names = [item["application"] for item in paid_applications]

        for item in overlapping:
            findings.append({
                "application": item["application"],
                "finding_type": Finding.FindingType.REDUNDANT,
                "severity": Finding.Severity.MEDIUM,
                "annual_spend": item["spend"],
                "potential_savings": item["spend"],
                "evidence": {
                    "overlapping_applications": overlap_names,
                    "recommended_primary": primary["application"],
                    "users": item["users"],
                    "sessions": item["sessions"],
                },
                "recommendation": (
                    f"Evaluate consolidating {item['application']} into "
                    f"{primary['application']}."
                ),
            })

    return findings


@transaction.atomic
def refresh_findings(organization):
    Finding.objects.filter(organization=organization).delete()
    inventory = list(get_saas_inventory(organization))
    generated = generate_savings_findings_from_inventory(inventory)
    generated.extend(generate_redundancy_findings(inventory))
    findings = [Finding(organization=organization, **item) for item in generated]
    Finding.objects.bulk_create(findings)
    return findings

from django.db.models import (
    Count,
    Sum,
    Max,
    Q,
)

from decimal import Decimal

from apps.expenses.models import Expense

from .models import UsageEvent


SAAS_DOMAINS = {
    "slack.com": "Slack",
    "notion.so": "Notion",
    "figma.com": "Figma",
    "github.com": "GitHub",
    "linear.app": "Linear",
    "atlassian.com": "Atlassian",
    "jira.com": "Jira",
    "dropbox.com": "Dropbox",
    "zoom.us": "Zoom",
    "canva.com": "Canva",
    "salesforce.com": "Salesforce",
    "hubspot.com": "HubSpot",
    "microsoft.com": "Microsoft",
    "office.com": "Microsoft 365",
    "google.com": "Google",
    "workspace.google.com": "Google Workspace",
}


def identify_application(domain: str) -> str:
    domain = domain.lower().strip()

    if domain.startswith("www."):
        domain = domain[4:]

    if domain in SAAS_DOMAINS:
        return SAAS_DOMAINS[domain]

    for known_domain, application in SAAS_DOMAINS.items():
        if domain.endswith("." + known_domain):
            return application

    return ""
def get_saas_usage(organization):
    events = (
        UsageEvent.objects
        .filter(
            organization=organization,
            application__isnull=False,
        )
        .exclude(application="")
    )

    return (
        events
        .values(
            "application",
        )
        .annotate(
            users=Count(
                "user",
                distinct=True,
            ),
            sessions=Count("id"),
            total_seconds=Sum(
                "duration_seconds"
            ),
            last_seen=Max(
                "occurred_at"
            ),
        )
        .order_by("-total_seconds")
    )


def get_saas_inventory(organization):
    usage_rows = (
        UsageEvent.objects
        .filter(
            organization=organization,
            application__isnull=False,
        )
        .exclude(application="")
        .values("application")
        .annotate(
            users=Count("user", distinct=True),
            sessions=Count("id"),
            total_seconds=Sum("duration_seconds"),
            last_seen=Max("occurred_at"),
        )
    )

    expense_rows = (
        Expense.objects
        .filter(organization=organization)
        .values("vendor")
        .annotate(
            total_spend=Sum("amount"),
            transactions=Count("id"),
        )
    )

    inventory = {}

    for row in expense_rows:
        vendor = row["vendor"].strip()
        if not vendor:
            continue

        application = identify_application(vendor) or vendor
        key = application.lower()
        inventory[key] = {
            "application": application,
            "spend": row["total_spend"] or Decimal("0"),
            "transactions": row["transactions"],
            "users": 0,
            "sessions": 0,
            "total_seconds": 0,
            "last_seen": None,
        }

    for row in usage_rows:
        application = row["application"]
        key = application.lower()

        if key not in inventory:
            inventory[key] = {
                "application": application,
                "spend": Decimal("0"),
                "transactions": 0,
                "users": 0,
                "sessions": 0,
                "total_seconds": 0,
                "last_seen": None,
            }

        inventory[key].update(
            users=row["users"],
            sessions=row["sessions"],
            total_seconds=row["total_seconds"] or 0,
            last_seen=row["last_seen"],
        )

    results = []
    for item in inventory.values():
        spend = item["spend"]
        users = item["users"]
        total_seconds = item["total_seconds"]
        total_hours = round(total_seconds / 3600, 2)

        if users == 0:
            utilization = "unknown"
        elif total_hours < 1:
            utilization = "low"
        elif total_hours < 10:
            utilization = "medium"
        else:
            utilization = "high"

        if spend > 0 and users == 0:
            status = "unverified"
        elif spend > 0 and utilization == "low":
            status = "low_usage"
        elif spend == 0 and users > 0:
            status = "shadow"
        else:
            status = "active"

        results.append({
            "application": item["application"],
            "spend": spend,
            "transactions": item["transactions"],
            "users": users,
            "sessions": item["sessions"],
            "total_seconds": total_seconds,
            "total_hours": total_hours,
            "last_seen": item["last_seen"],
            "utilization": utilization,
            "status": status,
        })

    return sorted(
        results,
        key=lambda item: (-float(item["spend"]), item["application"].lower()),
    )
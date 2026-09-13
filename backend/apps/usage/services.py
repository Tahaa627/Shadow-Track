from decimal import Decimal

from django.db.models import Count, Max, Sum

from apps.expenses.models import Expense

from .models import UsageEvent

# Some common SaaS application domains and their canonical names.
SAAS_DOMAINS = {
    "slack.com": "Slack",
    "notion.so": "Notion",
    "notion.com": "Notion",
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
    "microsoft.com": "Microsoft 365",
    "office.com": "Microsoft 365",
    "google.com": "Google Workspace",
    "workspace.google.com": "Google Workspace",
    "chatgpt.com": "ChatGPT",
}

# Some common vendor name aliases and their canonical names.
VENDOR_ALIASES = {
    "slack": "Slack",
    "slack technologies": "Slack",
    "slack inc": "Slack",

    "notion": "Notion",
    "notion labs": "Notion",

    "figma": "Figma",
    "figma inc": "Figma",

    "github": "GitHub",
    "github inc": "GitHub",

    "linear": "Linear",
    "linear inc": "Linear",

    "dropbox": "Dropbox",
    "dropbox inc": "Dropbox",

    "zoom": "Zoom",
    "zoom video communications": "Zoom",

    "canva": "Canva",

    "salesforce": "Salesforce",
    "salesforce.com": "Salesforce",

    "hubspot": "HubSpot",
    "hubspot inc": "HubSpot",

    "microsoft": "Microsoft 365",
    "microsoft corporation": "Microsoft 365",
    "microsoft 365": "Microsoft 365",
    "office 365": "Microsoft 365",

    "google": "Google Workspace",
    "google workspace": "Google Workspace",

    "openai": "ChatGPT",
    "chatgpt": "ChatGPT",
}

'''
    Meant by normalize_vendor is to take a vendor name or domain and return a canonical SaaS application
    name. It handles common vendor names, aliases, and domain recognition to ensure consistent naming 
    across the system.
'''
def normalize_vendor(value: str) -> str:
    """
    Convert common vendor names and aliases into a canonical
    SaaS application name.
    """

    if not value:
        return ""

    value = value.strip().lower()

    if value.startswith("www."):
        value = value[4:]

    # Domain recognition.
    if value in SAAS_DOMAINS:
        return SAAS_DOMAINS[value]

    for domain, application in SAAS_DOMAINS.items():
        if value.endswith("." + domain):
            return application

    # Remove common punctuation.
    normalized = (
        value
        .replace(",", "")
        .replace(".", "")
        .replace("-", " ")
        .replace("_", " ")
    )

    normalized = " ".join(normalized.split())

    if normalized in VENDOR_ALIASES:
        return VENDOR_ALIASES[normalized]

    return value.title()


def identify_application(domain: str) -> str:
    """
    Identify an application from a browser domain.
    """

    if not domain:
        return ""

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
        .values("application")
        .annotate(
            users=Count("user", distinct=True),
            sessions=Count("id"),
            total_seconds=Sum("duration_seconds"),
            last_seen=Max("occurred_at"),
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

    # ---------------------------------------------------------
    # Expenses
    # ---------------------------------------------------------

    for row in expense_rows:
        vendor = row["vendor"]

        application = normalize_vendor(vendor)

        if not application:
            continue

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

        inventory[key]["spend"] += (
            row["total_spend"] or Decimal("0")
        )

        inventory[key]["transactions"] += (
            row["transactions"] or 0
        )

    # ---------------------------------------------------------
    # Browser usage
    # ---------------------------------------------------------

    for row in usage_rows:
        application = normalize_vendor(row["application"])

        if not application:
            continue

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

        inventory[key]["users"] += row["users"] or 0
        inventory[key]["sessions"] += row["sessions"] or 0
        inventory[key]["total_seconds"] += (
            row["total_seconds"] or 0
        )

        if (
            inventory[key]["last_seen"] is None
            or row["last_seen"]
            > inventory[key]["last_seen"]
        ):
            inventory[key]["last_seen"] = row["last_seen"]

    # ---------------------------------------------------------
    # Classification
    # ---------------------------------------------------------

    results = []

    for item in inventory.values():
        spend = item["spend"]
        users = item["users"]
        total_seconds = item["total_seconds"]

        total_hours = round(
            total_seconds / 3600,
            2,
        )

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
        key=lambda item: (
            -float(item["spend"]),
            item["application"].lower(),
        ),
    )
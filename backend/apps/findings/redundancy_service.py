from decimal import Decimal

from apps.usage.services import get_saas_inventory


REDUNDANCY_GROUPS = {
    "communication": [
        "Slack",
        "Microsoft Teams",
        "Google Chat",
    ],
    "video_conferencing": [
        "Zoom",
        "Google Meet",
        "Microsoft Teams",
    ],
    "documentation": [
        "Notion",
        "Confluence",
        "Google Workspace",
    ],
    "file_storage": [
        "Dropbox",
        "Google Drive",
        "OneDrive",
    ],
    "design": [
        "Figma",
        "Canva",
    ],
    "project_management": [
        "Linear",
        "Jira",
        "Asana",
        "Trello",
    ],
}


def detect_redundancies(organization):
    inventory = get_saas_inventory(organization)

    inventory_map = {
        item["application"].lower(): item
        for item in inventory
    }

    redundancies = []

    for category, applications in REDUNDANCY_GROUPS.items():
        detected = []

        for application in applications:
            item = inventory_map.get(application.lower())

            if not item:
                continue

            if item["spend"] <= 0 and item["users"] <= 0:
                continue

            detected.append(item)

        if len(detected) < 2:
            continue

        total_spend = sum(
            (item["spend"] for item in detected),
            Decimal("0"),
        )

        total_users = sum(item["users"] for item in detected)
        total_hours = sum(item["total_hours"] for item in detected)

        paid_tools = [item for item in detected if item["spend"] > 0]

        if len(paid_tools) < 2:
            potential_savings = Decimal("0")
        else:
            least_used = sorted(
                paid_tools,
                key=lambda item: (
                    item["total_hours"],
                    item["users"],
                ),
            )[0]
            potential_savings = least_used["spend"]

        redundancies.append({
            "category": category,
            "applications": [
                item["application"]
                for item in detected
            ],
            "total_spend": total_spend,
            "total_users": total_users,
            "total_hours": round(total_hours, 2),
            "potential_savings": potential_savings,
            "evidence": [
                {
                    "application": item["application"],
                    "spend": str(item["spend"]),
                    "users": item["users"],
                    "sessions": item["sessions"],
                    "usage_hours": str(item["total_hours"]),
                    "status": item["status"],
                }
                for item in detected
            ],
        })

    return redundancies
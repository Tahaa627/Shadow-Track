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

import csv
import io
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from apps.expenses.models import Expense
from apps.findings.models import Finding
from apps.usage.services import get_saas_inventory
from .anomaly_service import detect_anomalies


REPORT_COLUMNS = [
    "transaction_date",
    "vendor",
    "amount",
    "currency",
    "description",
    "employee",
    "department",
    "source",
    "created_at",
]


def generate_expense_report(organization):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(REPORT_COLUMNS)

    expenses = Expense.objects.filter(
        organization=organization,
    ).order_by("transaction_date", "id")

    for expense in expenses:
        writer.writerow([
            expense.transaction_date.isoformat(),
            expense.vendor,
            expense.amount,
            expense.currency,
            expense.description,
            expense.employee,
            expense.department,
            expense.source,
            expense.created_at.isoformat(),
        ])

    return output.getvalue()


def get_monthly_spend(organization):
    rows = (
        Expense.objects
        .filter(organization=organization)
        .annotate(month=TruncMonth("transaction_date"))
        .values("month")
        .annotate(spend=Sum("amount"))
        .order_by("month")
    )

    return [
        {
            "month": row["month"].strftime("%Y-%m"),
            "spend": str(row["spend"] or Decimal("0")),
        }
        for row in rows
    ]


def get_dashboard_summary(organization):
    """
    Build the dashboard KPI summary from the organization's
    real expense, usage, inventory, and findings data.
    """
    total_spend = (
        Expense.objects
        .filter(organization=organization)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0")
    )

    today = timezone.localdate()

    monthly_spend = (
        Expense.objects
        .filter(
            organization=organization,
            transaction_date__year=today.year,
            transaction_date__month=today.month,
        )
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0")
    )

    inventory = get_saas_inventory(organization)

    active_tools = sum(
        1 for item in inventory
        if item["status"] == "active"
    )

    shadow_saas_count = sum(
        1 for item in inventory
        if item["status"] == "shadow"
    )

    findings = Finding.objects.filter(organization=organization)

    potential_savings = (
        findings.aggregate(total=Sum("potential_savings")).get("total")
        or Decimal("0")
    )

    high_risk_count = findings.filter(
        severity=Finding.Severity.HIGH
    ).count()

    total_findings = findings.count()

    if total_findings == 0:
        risk_score = 0
    else:
        risk_score = min(
            100,
            high_risk_count * 20 + shadow_saas_count * 5,
        )

    anomalies = len(detect_anomalies(organization))

    return {
        "total_spend": total_spend,
        "monthly_spend": monthly_spend,
        "risk_score": risk_score,
        "shadow_saas_count": shadow_saas_count,
        "active_tools": active_tools,
        "potential_savings": potential_savings,
        "anomalies": anomalies,
        "high_risk_findings": high_risk_count,
    }
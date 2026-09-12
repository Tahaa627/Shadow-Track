from collections import defaultdict
from decimal import Decimal

from django.db.models import Avg
from django.utils import timezone

from apps.expenses.models import Expense


SPEND_SPIKE_MULTIPLIER = Decimal("2.0")
SPEND_INCREASE_THRESHOLD = Decimal("0.50")
LARGE_TRANSACTION_MULTIPLIER = Decimal("3.0")


def _month_key(date):
    return date.year, date.month


def _previous_month(year, month):
    if month == 1:
        return year - 1, 12

    return year, month - 1


def detect_anomalies(organization):
    """Detect unusual expense activity for an organization."""
    expenses = list(
        Expense.objects
        .filter(organization=organization)
        .order_by("transaction_date", "id")
    )

    if not expenses:
        return []

    average_transaction = (
        Expense.objects
        .filter(organization=organization)
        .aggregate(avg=Avg("amount"))
        .get("avg")
        or Decimal("0")
    )

    vendor_monthly_spend = defaultdict(lambda: defaultdict(Decimal))

    for expense in expenses:
        vendor = expense.vendor.strip()
        month = _month_key(expense.transaction_date)
        vendor_monthly_spend[vendor][month] += expense.amount

    anomalies = []

    if average_transaction > 0:
        for expense in expenses:
            if expense.amount >= average_transaction * LARGE_TRANSACTION_MULTIPLIER:
                anomalies.append({
                    "type": "large_transaction",
                    "severity": "medium",
                    "vendor": expense.vendor,
                    "amount": str(expense.amount),
                    "date": expense.transaction_date.isoformat(),
                    "description": (
                        f"{expense.vendor} transaction of "
                        f"${expense.amount:,.2f} is unusually large "
                        f"compared with the organization's average "
                        f"transaction of ${average_transaction:,.2f}."
                    ),
                    "evidence": {
                        "transaction_amount": str(expense.amount),
                        "average_transaction": str(average_transaction),
                        "multiplier": str(expense.amount / average_transaction),
                    },
                })

    for vendor, monthly_spend in vendor_monthly_spend.items():
        months = sorted(monthly_spend.keys())

        if not months:
            continue

        latest_month = months[-1]
        latest_spend = monthly_spend[latest_month]
        previous_month = _previous_month(*latest_month)
        previous_spend = monthly_spend.get(previous_month, Decimal("0"))

        historical_months = [month for month in months if month < latest_month]

        if not historical_months and latest_spend > 0:
            anomalies.append({
                "type": "new_vendor",
                "severity": "medium",
                "vendor": vendor,
                "amount": str(latest_spend),
                "date": f"{latest_month[0]:04d}-{latest_month[1]:02d}",
                "description": (
                    f"{vendor} appeared as a new vendor with "
                    f"${latest_spend:,.2f} in spend."
                ),
                "evidence": {"current_spend": str(latest_spend)},
            })

        if previous_spend > 0:
            increase = (latest_spend - previous_spend) / previous_spend

            if increase >= SPEND_INCREASE_THRESHOLD:
                anomalies.append({
                    "type": "spend_increase",
                    "severity": "medium",
                    "vendor": vendor,
                    "amount": str(latest_spend),
                    "date": f"{latest_month[0]:04d}-{latest_month[1]:02d}",
                    "description": (
                        f"{vendor} spend increased by "
                        f"{increase * 100:.1f}% month-over-month."
                    ),
                    "evidence": {
                        "current_spend": str(latest_spend),
                        "previous_spend": str(previous_spend),
                        "increase_percent": str(increase * 100),
                    },
                })

        historical_spend = [
            monthly_spend[month]
            for month in months
            if month < latest_month
        ]

        if historical_spend:
            historical_average = sum(
                historical_spend,
                Decimal("0"),
            ) / len(historical_spend)

            if (
                historical_average > 0
                and latest_spend >= historical_average * SPEND_SPIKE_MULTIPLIER
            ):
                anomalies.append({
                    "type": "spend_spike",
                    "severity": "high",
                    "vendor": vendor,
                    "amount": str(latest_spend),
                    "date": f"{latest_month[0]:04d}-{latest_month[1]:02d}",
                    "description": (
                        f"{vendor} spend is "
                        f"{latest_spend / historical_average:.1f}x "
                        f"its historical monthly average."
                    ),
                    "evidence": {
                        "current_spend": str(latest_spend),
                        "historical_average": str(historical_average),
                        "multiplier": str(latest_spend / historical_average),
                    },
                })

    severity_order = {"high": 0, "medium": 1, "low": 2}
    anomalies.sort(
        key=lambda item: (
            severity_order.get(item["severity"], 99),
            item["vendor"],
        )
    )

    return anomalies
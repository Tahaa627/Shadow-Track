from collections import defaultdict
from decimal import Decimal

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
    expenses = list(
        Expense.objects
        .filter(organization=organization)
        .order_by("transaction_date", "id")
    )

    if not expenses:
        return []

    average_transaction = (
        sum((expense.amount for expense in expenses), Decimal("0"))
        / len(expenses)
    )

    vendor_month_spend = defaultdict(Decimal)
    vendor_first_month = {}
    monthly_spend = defaultdict(Decimal)

    for expense in expenses:
        month = _month_key(expense.transaction_date)
        vendor = expense.vendor.strip()

        vendor_month_spend[(vendor, month)] += expense.amount
        monthly_spend[month] += expense.amount

        if vendor not in vendor_first_month:
            vendor_first_month[vendor] = month

    latest_month = max(monthly_spend)
    anomalies = []

    for expense in expenses:
        if (
            average_transaction > 0
            and expense.amount
            >= average_transaction * LARGE_TRANSACTION_MULTIPLIER
        ):
            anomalies.append({
                "type": "large_transaction",
                "severity": "high",
                "vendor": expense.vendor,
                "amount": str(expense.amount),
                "date": expense.transaction_date.isoformat(),
                "description": (
                    f"{expense.vendor} transaction is significantly "
                    "larger than the organization's average transaction."
                ),
                "evidence": {
                    "average_transaction": str(average_transaction),
                    "multiplier": str(LARGE_TRANSACTION_MULTIPLIER),
                },
            })

    for vendor, first_month in vendor_first_month.items():
        if first_month == latest_month:
            amount = vendor_month_spend[(vendor, latest_month)]

            anomalies.append({
                "type": "new_vendor",
                "severity": "medium",
                "vendor": vendor,
                "amount": str(amount),
                "date": f"{latest_month[0]}-{latest_month[1]:02d}-01",
                "description": (
                    f"{vendor} appears for the first time in the latest "
                    "expense month."
                ),
                "evidence": {
                    "first_month": (
                        f"{first_month[0]}-{first_month[1]:02d}"
                    ),
                },
            })

    previous_month = _previous_month(*latest_month)
    latest_total = monthly_spend[latest_month]
    previous_total = monthly_spend.get(previous_month, Decimal("0"))

    if previous_total > 0:
        increase = (latest_total - previous_total) / previous_total

        if increase >= SPEND_INCREASE_THRESHOLD:
            anomalies.append({
                "type": "spend_increase",
                "severity": "high",
                "vendor": "Organization",
                "amount": str(latest_total),
                "date": f"{latest_month[0]}-{latest_month[1]:02d}-01",
                "description": (
                    "Total spend increased by "
                    f"{increase * 100:.1f}% compared with the previous month."
                ),
                "evidence": {
                    "latest_month_spend": str(latest_total),
                    "previous_month_spend": str(previous_total),
                    "increase_percent": round(float(increase * 100), 2),
                },
            })

    historical_months = [
        value
        for month, value in monthly_spend.items()
        if month != latest_month
    ]

    if historical_months:
        historical_average = (
            sum(historical_months, Decimal("0"))
            / len(historical_months)
        )

        if (
            historical_average > 0
            and latest_total
            >= historical_average * SPEND_SPIKE_MULTIPLIER
        ):
            anomalies.append({
                "type": "spend_spike",
                "severity": "high",
                "vendor": "Organization",
                "amount": str(latest_total),
                "date": f"{latest_month[0]}-{latest_month[1]:02d}-01",
                "description": (
                    "Latest monthly spend is significantly above "
                    "the historical monthly average."
                ),
                "evidence": {
                    "latest_month_spend": str(latest_total),
                    "historical_average": str(historical_average),
                    "multiplier": str(SPEND_SPIKE_MULTIPLIER),
                },
            })

    severity_order = {
        "high": 0,
        "medium": 1,
        "low": 2,
    }

    anomalies.sort(
        key=lambda item: (
            severity_order[item["severity"]],
            item["date"],
        ),
        reverse=False,
    )

    return anomalies

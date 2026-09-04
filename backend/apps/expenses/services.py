import csv
import io
import re
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.db import transaction

from .models import Expense


VENDOR_ALIASES = {
    "slack technologies": "Slack",
    "slack inc": "Slack",
    "slack": "Slack",
    "notion labs": "Notion",
    "notion": "Notion",
    "figma inc": "Figma",
    "figma": "Figma",
    "microsoft corporation": "Microsoft",
    "microsoft": "Microsoft",
    "microsoft 365": "Microsoft 365",
}


REQUIRED_COLUMNS = {"vendor", "amount", "transaction_date"}

COLUMN_ALIASES = {
    "vendor": "vendor",
    "merchant": "vendor",
    "merchant_name": "vendor",
    "amount": "amount",
    "total": "amount",
    "cost": "amount",
    "price": "amount",
    "currency": "currency",
    "date": "transaction_date",
    "transaction_date": "transaction_date",
    "purchase_date": "transaction_date",
    "description": "description",
    "employee": "employee",
    "employee_name": "employee",
    "department": "department",
}


def normalize_header(value):
    return value.strip().lower().replace(" ", "_").replace("-", "_")


def normalize_vendor(value):
    vendor = " ".join(value.strip().split())

    vendor = re.sub(r"[.,]+$", "", vendor)
    normalized = vendor.lower()

    if normalized in VENDOR_ALIASES:
        return VENDOR_ALIASES[normalized]

    return vendor


def parse_amount(value):
    cleaned = str(value).strip().replace(",", "").replace("$", "")

    try:
        return Decimal(cleaned)
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"Invalid amount: {value}") from exc


def parse_date(value):
    value = str(value).strip()
    formats = ["%Y-%m-%d", "%m/%d/%Y", "%m/%d/%y", "%d/%m/%Y"]

    for date_format in formats:
        try:
            return datetime.strptime(value, date_format).date()
        except ValueError:
            continue

    raise ValueError(f"Invalid date: {value}")


@transaction.atomic
def process_expense_csv(file, organization, user):
    decoded = file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))

    if not reader.fieldnames:
        raise ValueError("CSV file has no headers.")

    normalized_headers = {
        normalize_header(header): header
        for header in reader.fieldnames
        if header
    }
    mapped_columns = {
        COLUMN_ALIASES[normalized]: original
        for normalized, original in normalized_headers.items()
        if normalized in COLUMN_ALIASES
    }

    missing_columns = REQUIRED_COLUMNS - mapped_columns.keys()
    if missing_columns:
        raise ValueError(
            "Missing required columns: " + ", ".join(sorted(missing_columns))
        )

    created = []
    errors = []

    for row_number, row in enumerate(reader, start=2):
        try:
            vendor = normalize_vendor(row[mapped_columns["vendor"]])
            if not vendor:
                raise ValueError("Vendor is required.")

            values = {
                "organization": organization,
                "vendor": vendor,
                "amount": parse_amount(row[mapped_columns["amount"]]),
                "transaction_date": parse_date(
                    row[mapped_columns["transaction_date"]]
                ),
                "currency": "USD",
                "description": "",
                "employee": "",
                "department": "",
                "source": Expense.Source.CSV,
                "created_by": user,
            }

            for field in ("currency", "description", "employee", "department"):
                if field in mapped_columns:
                    value = row.get(mapped_columns[field], "") or ""
                    values[field] = value.strip()
            values["currency"] = values["currency"].upper()
            created.append(Expense(**values))
        except (ValueError, KeyError) as exc:
            errors.append({"row": row_number, "error": str(exc)})

    Expense.objects.bulk_create(created)
    total_spend = sum((expense.amount for expense in created), Decimal("0"))

    return {
        "total_rows": len(created) + len(errors),
        "processed": len(created),
        "failed": len(errors),
        "total_spend": total_spend,
        "errors": errors[:100],
    }
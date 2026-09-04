from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            "id",
            "vendor",
            "amount",
            "currency",
            "transaction_date",
            "description",
            "employee",
            "department",
            "source",
            "created_at",
        ]
        read_only_fields = fields

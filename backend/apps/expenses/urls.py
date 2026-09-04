from django.urls import path

from .views import ExpenseCSVUploadView, ExpenseListView


urlpatterns = [
    path("upload/", ExpenseCSVUploadView.as_view(), name="expense-csv-upload"),
    path("", ExpenseListView.as_view(), name="expense-list"),
]
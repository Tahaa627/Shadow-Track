from django.urls import path

from .views import ExpenseCSVUploadView


urlpatterns = [
    path("upload/", ExpenseCSVUploadView.as_view(), name="expense-csv-upload"),
]
from rest_framework import status
from rest_framework import generics
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense
from .serializers import ExpenseSerializer
from .services import process_expense_csv


class ExpenseListView(generics.ListAPIView):
	permission_classes = [IsAuthenticated]
	serializer_class = ExpenseSerializer

	def get_queryset(self):
		organization = getattr(self.request.user, "organization", None)

		if organization is None:
			return Expense.objects.none()

		return Expense.objects.filter(
			organization=organization
		).select_related("organization")


class ExpenseCSVUploadView(APIView):
	permission_classes = [IsAuthenticated]
	parser_classes = [MultiPartParser, FormParser]

	def post(self, request):
		uploaded_file = request.FILES.get("file")

		if not uploaded_file:
			return Response(
				{"detail": "CSV file is required."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		if not uploaded_file.name.lower().endswith(".csv"):
			return Response(
				{"detail": "Only CSV files are supported."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		organization = getattr(request.user, "organization", None)

		if organization is None:
			return Response(
				{"detail": "User is not associated with an organization."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		try:
			result = process_expense_csv(
				uploaded_file,
				organization,
				request.user,
			)
		except UnicodeDecodeError:
			return Response(
				{
					"detail": (
						"Unable to read the CSV file. "
						"Please save it as UTF-8."
					)
				},
				status=status.HTTP_400_BAD_REQUEST,
			)
		except ValueError as exc:
			return Response(
				{"detail": str(exc)},
				status=status.HTTP_400_BAD_REQUEST,
			)

		return Response(result, status=status.HTTP_201_CREATED)

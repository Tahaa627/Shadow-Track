from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Finding
from .serializers import FindingSerializer
from .services import refresh_findings


class FindingListView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		organization = getattr(request.user, "organization", None)
		if organization is None:
			return Response([])

		refresh_findings(organization)
		findings = Finding.objects.filter(organization=organization)
		serializer = FindingSerializer(findings, many=True)
		return Response(serializer.data)

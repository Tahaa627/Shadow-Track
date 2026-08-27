from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsAdmin, IsAdminOrManager, CanManageUser
from .selectors import get_organization_users
from .serializers import (
    RegisterSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from .services import (
    create_user,
    deactivate_user,
    update_user,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=201,
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListCreateView(generics.ListCreateAPIView):

    def get_permissions(self):
        return [
            IsAuthenticated(),
            IsAdminOrManager(),
        ]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer

        return UserSerializer

    def get_queryset(self):
        return get_organization_users(
            organization_id=self.request.user.organization_id
        )

    def perform_create(self):
        serializer = self.get_serializer(
            data=self.request.data
        )
        serializer.is_valid(raise_exception=True)

        create_user(
            organization=self.request.user.organization,
            **serializer.validated_data,
        )


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        return get_organization_users(
            organization_id=self.request.user.organization_id
        )

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [
                IsAuthenticated(),
                IsAdmin(),
            ]

        if self.request.method in ("PUT", "PATCH"):
            return [
                IsAuthenticated(),
                CanManageUser(),
            ]

        return [
            IsAuthenticated(),
        ]

    def perform_update(self, serializer):
        update_user(
            user=serializer.instance,
            **serializer.validated_data,
        )

    def perform_destroy(self, instance):
        deactivate_user(
            user=instance,
        )
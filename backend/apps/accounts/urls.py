from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import EmailTokenObtainPairSerializer
from .views import (MeView, RegisterView, UserDetailView, UserListCreateView)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        EmailTokenObtainPairView.as_view(),
        name="login",
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="refresh",
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),
    path(
        "users/",
        UserListCreateView.as_view(),
        name="user-list-create",
    ),
    path(
        "users/<uuid:pk>/",
        UserDetailView.as_view(),
        name="user-detail",
    ),
]
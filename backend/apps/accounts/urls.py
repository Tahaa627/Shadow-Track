from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (MeView, RegisterView, UserDetailView)


urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
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
        "users/<uuid:pk>/",
        UserDetailView.as_view(),
        name="user-detail",
    ),
]
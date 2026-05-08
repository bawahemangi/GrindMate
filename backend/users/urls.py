from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("groups/", views.GroupListCreateView.as_view(), name="groups"),
    path("groups/<int:pk>/", views.GroupDetailView.as_view(), name="group-detail"),
    path("groups/join/", views.join_group, name="join-group"),
    path("groups/<int:pk>/leave/", views.leave_group, name="leave-group"),
    path("groups/<int:pk>/leaderboard/", views.group_leaderboard, name="leaderboard"),
]

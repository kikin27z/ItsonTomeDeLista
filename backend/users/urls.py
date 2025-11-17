from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import *
from django.urls import path

urlpatterns = [
    path("users/massive/", MassiveInsertion, name="massive-insertion"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
]

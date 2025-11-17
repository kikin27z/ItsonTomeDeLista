from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(["POST"])
def MassiveInsertion(request):
    if Profile.objects.exists():
        # 2. Si ya existen, retorna un error 400 (Bad Request)
        return Response(
            {"detail": "La inserción masiva de usuarios ya se ha realizado anteriormente. No se pueden agregar más."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = UserRegistrationSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

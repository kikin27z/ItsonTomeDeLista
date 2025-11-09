from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        token["email"] = user.email

        if hasattr(user, "profile"):
            token["userType"] = user.profile.user_type
            token["major"] = user.profile.major
            token["name"] = user.profile.complete_name()

        return token


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "user_type",
            "first_name",
            "middle_name",
            "surname",
            "unique_id",
            "major",
            "department",
        ]

    def validate(self, data):
        if data.get("user_type") == "STUDENT" and not data.get("major"):
            raise serializers.ValidationError(
                {"major": "Campo requerido para estudiantes"}
            )

        if data.get("user_type") == "TEACHER" and not data.get("department"):
            raise serializers.ValidationError(
                {"department": "Campo requerido para profesores"}
            )

        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["username", "email", "password", "profile"]

    def create(self, validated_data):
        profile_data = validated_data.pop("profile")

        # Crear User
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

        # Crear UserProfile
        Profile.objects.create(user=user, **profile_data)

        return user

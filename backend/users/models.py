from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    USER_TYPES = {"STUDENT": "Estudiante", "TEACHER": "Profesor"}

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    user_type = models.CharField(max_length=20, choices=USER_TYPES)

    # Common fields
    first_name = models.CharField(max_length=30)
    middle_name = models.CharField(max_length=30, null=True, blank=True)
    surname = models.CharField(max_length=60)
    unique_id = models.CharField(max_length=11)

    # Student fields
    major = models.CharField(max_length=80, null=True)
    # Teacher fields
    department = models.CharField(max_length=80, null=True)

    def complete_name(self):
        parts = [self.first_name, self.middle_name, self.surname]
        return " ".join(part for part in parts if part)

    def __str__(self):
        return f"Profile [ID: {self.unique_id} - Name: {self.complete_name()}]"

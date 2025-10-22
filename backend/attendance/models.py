from django.db import models

# Create your models here.
class ClassSession(models.Model):
  STATUS_CHOICES = {
    "ACTIVE": "Activa",
    "CLOSED": "Cerrada"
  }
  
  schedule = models.ForeignKey("academic.Schedule", on_delete=models.SET_NULL, null=True)
  date = models.DateField(auto_now_add=True)
  actual_start_time = models.DateTimeField(auto_now_add=True)
  status = models.CharField(max_length=8,choices=STATUS_CHOICES, default=STATUS_CHOICES["ACTIVE"])
  attendance_code = models.CharField(max_length=100)
  
  
class AttendanceRecord(models.Model):
  STATUS_CHOICES = {
    "PRESENT": "Presente",
    "LATE": "Tardia",
    "JUSTIFIED": "Justificada",
    "ABSENT": "Ausente"
  }
  
  student = models.ForeignKey("users.Student", on_delete=models.SET_NULL, null=True)
  class_sesion = models.ForeignKey(ClassSession, on_delete=models.CASCADE)
  status = models.CharField(max_length=10,choices=STATUS_CHOICES, default=STATUS_CHOICES["ABSENT"])
  registration_datetime = models.DateTimeField(auto_now_add=True)
  
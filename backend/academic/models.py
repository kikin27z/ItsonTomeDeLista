from django.db import models

class Course(models.Model):
  name = models.CharField(max_length=50)
  credits = models.DecimalField(max_digits=5, decimal_places=2)
  deparment = models.CharField(max_length=80)
  key_name = models.CharField(max_length=7)
  
class Schedule(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE)
  teacher = models.ForeignKey("users.Teacher",on_delete=models.SET_NULL, null=True)
  start_time = models.DateField(null=False, blank=False)
  end_time = models.DateField(null=False, blank=False)
  classroom = models.CharField(max_length=10)
  days_of_week = models.CharField(max_length=7)
  academic_period = models.CharField(max_length=40)
  
class Enrollment(models.Model):
  STATUS_CHOICES = {
    "ACTIVE": "Activo",
    "SUSPENDED": "Suspendido" 
  } 
  
  student = models.ForeignKey("users.Student", on_delete=models.SET_NULL,null=True)
  schedule = models.ForeignKey(Schedule, on_delete=models.SET_NULL, null=True)
  status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_CHOICES["ACTIVE"])

  
  
  
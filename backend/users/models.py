from django.db import models

# Create your models here.
class Student(models.Model):
  first_name = models.CharField(max_length=30)
  middle_name = models.CharField(max_length=30)
  surname = models.CharField(max_length=60)
  student_id = models.CharField(max_length=11)
  email = models.EmailField(max_length=200)
  major = models.CharField(max_length=80)
  
  def __str__(self):
    return f"ID: {self.student_id} - Alumno: {self.first_name} {self.middle_name} {self.surname} - Carrera: {self.major}"
  
  
class Teacher(models.Model):
  first_name = models.CharField(max_length=30)
  middle_name = models.CharField(max_length=30)
  surname = models.CharField(max_length=60)
  profesor_id = models.CharField(max_length=11)
  email = models.EmailField(max_length=200)
  department = models.CharField(max_length=80)
  
  def __str__(self):
    return f"ID: {self.student_id} - Profesor: {self.first_name} {self.middle_name} {self.surname} - Departamento: {self.major}"
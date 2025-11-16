from datetime import datetime
from django.db import models

from attendance.models import ClassSession
from users.models import Profile
from django.utils import timezone


class Course(models.Model):
    name = models.CharField(max_length=50)
    credits = models.DecimalField(max_digits=5, decimal_places=2)
    deparment = models.CharField(max_length=80)
    key_name = models.CharField(max_length=7)

    def __str__(self):
        return f"Clase: {self.name} "


class Schedule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        "users.Profile",
        on_delete=models.SET_NULL,
        null=True,
        related_name="schedules_assigned",
    )
    start_time = models.TimeField(null=False, blank=False)
    end_time = models.TimeField(null=False, blank=False)
    classroom = models.CharField(max_length=10)
    days_of_week = models.CharField(max_length=12)
    end_date = models.DateField(null=False, blank=False)
    start_date = models.DateField(null=False, blank=False)

    def __str__(self):
        return f"Id: {self.id} - {self.course} - Profesor: {self.teacher} Horario: {self.days_of_week} de {self.start_time} a {self.end_time} y salon {self.classroom}"

    def get_students(self):
        return Profile.objects.filter(
            course_enrolled__schedule=self
        ).distinct()

    def get_today_session(self):
        now = timezone.now()
        return ClassSession.objects.filter(actual_start_time__date=now, schedule=self).first()

    def is_active_now(self):
        now = datetime.now()
        today = now.date()
        now_time = now.time()

        # Use <= and >= to include the start/end times
        is_in_date_range = self.start_date <= today <= self.end_date
        #is_in_time_range = self.start_time <= now_time <= self.end_time

        return is_in_date_range #@ and is_in_time_range

class Enrollment(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Activo"),
        ("SUSPENDED", "Suspendido"),
    ]

    student = models.ForeignKey(
        "users.Profile",
        on_delete=models.SET_NULL,
        null=True,
        related_name="course_enrolled",
    )
    schedule = models.ForeignKey(Schedule, on_delete=models.SET_NULL, null=True,related_name="enrollments")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")

    def __str__(self):
        return f"Inscrito {self.student} a {self.schedule}"

    @staticmethod
    def is_student_enrolled_for_code(attendance_code, student_id):
        return Enrollment.objects.filter(
            schedule__classsession__attendance_code=attendance_code,
            student_id=student_id,
            status='ACTIVE'
        ).exists()

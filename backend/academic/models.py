from django.db import models


class Course(models.Model):
    name = models.CharField(max_length=50)
    credits = models.DecimalField(max_digits=5, decimal_places=2)
    deparment = models.CharField(max_length=80)
    key_name = models.CharField(max_length=7)

    def __str__(self):
        return f"Clase: {self.name}"


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
        return f"{self.course} - Profesor: {self.teacher} Horario: {self.days_of_week} de {self.start_time} a {self.end_time} y salon {self.classroom}"


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
    schedule = models.ForeignKey(Schedule, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")

    def __str__(self):
        return f"Inscrito {self.student} a {self.schedule}"

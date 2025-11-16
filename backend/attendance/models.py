from datetime import date, datetime
from django.db import models, transaction
from academic.utils.code import create_class_code


# Create your models here.
class ClassSession(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Activa"),
        ("CLOSED", "Cerrada"),
    ]

    schedule = models.ForeignKey(
        "academic.Schedule", on_delete=models.SET_NULL, null=True, related_name='class_session'
    )
    actual_start_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default="ACTIVE")
    attendance_code = models.CharField(max_length=100)

    @classmethod
    @transaction.atomic
    def create_new_session(cls,schedule):
        code = create_class_code('ASIS')
        new_session = cls.objects.create(schedule=schedule, attendance_code=code)

        students = schedule.get_students()


        records_to_create = []
        for student in students:
            records_to_create.append(
                AttendanceRecord(
                    student=student,
                    class_session=new_session,
                    status="ABSENT"
                )
            )

        if records_to_create:
            AttendanceRecord.objects.bulk_create(records_to_create)

        return new_session

    @staticmethod
    def has_session_today(schedule):
        today = date.today()
        return ClassSession.objects.filter(
            schedule=schedule,
            actual_start_time__date=today
        ).exists()

    def get_attendances(self, status=None):
        queryset = AttendanceRecord.objects.filter(class_session=self)
        if not status:
            return queryset

        return queryset.filter(
            status=status
        )

    def  students_count(self):
        return AttendanceRecord.objects.filter(class_sesion=self).count()



    def __str__(self):
        return f'Sesion [Horario {self.schedule.start_time}-{self.schedule.end_time} - Codigo: {self.attendance_code} - Status: {self.status}]'


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ("PRESENT", "Presente"),
        ("LATE", "Tardia"),
        ("JUSTIFIED", "Justificada"),
        ("ABSENT", "Ausente"),
    ]

    student = models.ForeignKey("users.Profile", on_delete=models.SET_NULL, null=True)
    class_session = models.ForeignKey(ClassSession, on_delete=models.CASCADE, related_name="attendances")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ABSENT")
    registration_datetime = models.DateTimeField(null=True, blank=True)


    def __str__(self):
        return f'Attendace [{self.student} - status: {self.status} --- {self.class_session}]'

    @staticmethod
    def student_enrolled_in_session_today(attendance_code, student_id):
        return AttendanceRecord.objects.filter(
            class_session__attendance_code=attendance_code,
            class_session__actual_start_time__date=date.today(),
            student__unique_id=student_id,
        ).first()

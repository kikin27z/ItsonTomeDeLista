from rest_framework import serializers

from attendance.serializers import ClassSessionDetailSerializer
from .models import Course, Schedule, Enrollment
from users.serializers import ProfileSerializer
from users.models import Profile


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"
        # fields = ["id","name","credits","department","key_name"]


class ScheduleShallowSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Schedule
        fields = [
            "id",
            "course",
            "start_time",
            "end_time",
            "start_date",
            "end_date",
            "classroom",
            "days_of_week",
        ]


class ScheduleSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(write_only=True, required=True)
    teacher_id = serializers.IntegerField(
        write_only=True, allow_null=True, required=False
    )
    course = CourseSerializer(read_only=True)
    teacher = ProfileSerializer(read_only=True)
    start_time = serializers.TimeField()
    end_date = serializers.DateField()
    start_date = serializers.DateField()
    end_time = serializers.TimeField()
    classroom = serializers.RegexField(
        max_length=10,
        regex=r"^\d{3,5}(AV|LV)$",
        error_messages={
            "invalid": "Salon debe tener el siguiente formato 0000LV o 0000AV"
        },
    )
    days_of_week = serializers.RegexField(
        max_length=12, regex=r"^(Lu)?(Ma)?(Mi)?(Ju)?(Vi)?(Sa)?$"
    )
    # class_session = ClassSessionDetailSerializer(read_only=True, many=True)


    def create(self, validated_data):
        schedule = Schedule.objects.create(**validated_data)
        return schedule

    def update(self, instance, validated_data):
        instance.course = validated_data.get("course", instance.course)
        instance.teacher = validated_data.get("teacher", instance.teacher)

        # Update all other fields
        instance.start_time = validated_data.get("start_time", instance.start_time)
        instance.end_time = validated_data.get("end_time", instance.end_time)
        instance.classroom = validated_data.get("classroom", instance.classroom)
        instance.days_of_week = validated_data.get(
            "days_of_week", instance.days_of_week
        )
        instance.academic_period = validated_data.get(
            "academic_period", instance.academic_period
        )

        # Save the updated instance to the database
        instance.save()
        return instance


class EnrollmentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(write_only=True, required=True)
    schedule_id = serializers.IntegerField(write_only=True, required=True)
    status = serializers.CharField(max_length=10)

    def validate_status(self, value):
        valid_values = ["ACTIVE", "SUSPENDED"]

        if value not in valid_values:
            raise serializers.ValidationError(
                "Estado de la asignacion de la inscripcion"
            )
        return value

    def create(self, validated_data):
        student_id = validated_data.pop("student_id")
        schedule_id = validated_data.pop("schedule_id")

        try:
            student_obj = Profile.objects.get(pk=student_id)
            schedule_obj = Schedule.objects.get(pk=schedule_id)
        except (Profile.DoesNotExist, Schedule.DoesNotExist):
            raise serializers.ValidationError("El estudiante o el horario no existen.")

        enrollment = Enrollment.objects.create(
            student=student_obj, schedule=schedule_obj, **validated_data
        )
        return enrollment

    def update(self, instance, validated_data):
        instance.student_id = validated_data.get("student_id", instance.student)
        instance.schedule_id = validated_data.get("schedule_id", instance.schedule)
        instance.status = validated_data.get("status", instance.status)

        instance.save()
        return instance

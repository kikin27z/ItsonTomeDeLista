from rest_framework import serializers
from users.serializers import  ProfileShallowSerializer
from .models import ClassSession, AttendanceRecord
import re

class RegisterAttendanceSerializer(serializers.Serializer):
    student_id = serializers.CharField(required=True)
    attendance_code = serializers.CharField(min_length=13, required=True)

    def validate_attendance_code(self, value):
        if not len(value.strip()) >= 13:
            raise serializers.ValidationError("El codigo debe tener 13 caracteres")
        return value

    def validate_student_id(self, value):
        if not re.match(r"^00000\d{6}$", value):
            raise serializers.ValidationError("La matricula del estudiante debe coindicir con 00000######")
        return value

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student = ProfileShallowSerializer(read_only=True)
    class Meta:
        model = AttendanceRecord
        fields = "__all__"


class ClassSessionShallowSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSession
        fields = ['actual_start_time']

class ClassSessionDetailSerializer(serializers.ModelSerializer):
    attendances = AttendanceRecordSerializer(many=True, read_only=True)

    class Meta:
        model = ClassSession
        # 4. List all the fields you want in the output
        fields = [
            'id',
            'actual_start_time',
            'status',
            'attendance_code',
            'attendances'  # <--- 5. Our new nested list
        ]

class AttendanceHistorySerializer(serializers.ModelSerializer):
    class_session = ClassSessionShallowSerializer(read_only=True)
    class Meta:
        model = AttendanceRecord
        fields = "__all__"


class AttendanceHistoryListSerializer(serializers.Serializer):
    student__unique_id = serializers.CharField()
    complete_name = serializers.CharField()
    class_session__actual_start_time = serializers.DateTimeField()
    status = serializers.CharField()
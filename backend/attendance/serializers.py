from rest_framework import serializers
from academic.serializers import ScheduleSerializer
from .models import ClassSession, AttendanceRecord


class ClassSessionSerializer(serializers.Serializer):
  
  schedule_id = serializers.IntegerField(required=True, write_only=True)
  schedule = ScheduleSerializer(read_only=True)
  actual_start_time = serializers.DateField(read_only=True)
  status = serializers.CharField(max_length=8)
  attendance_code = serializers.CharField(max_length=100)
  
  
  def create(self, validated_data):
    class_session = ClassSession.objects.create(**validated_data)
    return class_session
  
  def update(self, instance, validated_data):
    instance.schedule_id = validated_data.get('schedule_id', instance.schedule_id)
    instance.actual_start_time = validated_data.get('actual_start_time', instance.actual_start_time)
    instance.status = validated_data.get('status', instance.status)
    instance.attendance_code = validated_data.get('attendance_code', instance.attendance_code)
    
    instance.save()
    return instance
  
class AttendanceRecordSerializer(serializers.ModelSerializer):
  class Meta:
    model = AttendanceRecord
    fields = '__all__'
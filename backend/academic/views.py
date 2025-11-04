from rest_framework import viewsets,status
from rest_framework.decorators import api_view
from .models import Course,Schedule
from users.models import Profile
from .serializers import *
from rest_framework.response import Response

class CourseViewSet(viewsets.ModelViewSet):
  queryset = Course.objects.all()
  serializer_class = CourseSerializer

@api_view(['POST'])
def MassiveInsertionCourse(request):
  serializer = CourseSerializer(data = request.data, many=True)
  if serializer.is_valid():
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)
  return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def MassiveInsertionSchedule(request):
  serializer = ScheduleSerializer(data = request.data, many=True)
  if serializer.is_valid():
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)
  return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def MassiveInsertionEnrollment(request):
  schedule_id = request.data.get('schedule_id')
  print(schedule_id)
  if schedule_id is None:
      return Response({"error": "Id de la materia no asignada"}, status=status.HTTP_400_BAD_REQUEST)
  try:
    schedule = Schedule.objects.get(pk=schedule_id)
  except Schedule.DoesNotExist:
    return Response({"error": "Materia inexistente"}, status=status.HTTP_404_NOT_FOUND)
  
  students = Profile.objects.filter(user_type="STUDENT")
  enrollments = []
  for s in students:
    enrollments.append({
      "schedule_id": schedule.id,
      "status": "ACTIVE",
      "student_id": s.id
    })
  serializer = EnrollmentSerializer(data=enrollments, many=True)
  if serializer.is_valid():
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)
  return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
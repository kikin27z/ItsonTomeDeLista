from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from django.db.models import Value
from django.db.models.functions import Concat
from .serializers import *
from rest_framework.response import Response
from datetime import date
import re


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def GetScheduleById(request, teacher_id):
    if not teacher_id or not re.fullmatch(r"^00000\d{6}$", teacher_id):
        return Response(
            {"message": "ID del profesor no asignado o no cumple con el formato"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = date.today()
    schedules = (
        Schedule.objects.select_related("course", "teacher")
        .filter(teacher__unique_id=teacher_id, start_date__lte=now, end_date__gte=now)
        .order_by("course__name")
    )

    serializer = ScheduleShallowSerializer(schedules, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def GetScheduleByStudent(request, student_username):
    student = get_object_or_404(Profile, unique_id=student_username)
    schedules = Schedule.objects.filter(
        enrollments__student=student,
        enrollments__status="ACTIVE"
    )

    serializer = ScheduleShallowSerializer(schedules, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def GetScheduleDetail(request,id):
    if not id:
        return Response(
            {"message": "ID de la clase no proporcionado"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        schedule = Schedule.objects.get(pk=id)
        serializer = ScheduleSerializer(schedule)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Schedule.DoesNotExist:
        return Response(
            {"error": "Materia inexistente"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
def GetStudentsFromSchedule(request, schedule_id):
    try:
        schedule_obj = Schedule.objects.get(pk=schedule_id)
    except Schedule.DoesNotExist:
        return Response(
            {"error": "Horario no encontrado"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    students = Enrollment.objects.filter(
        schedule=schedule_obj,
        status="ACTIVE"
    ).values_list("student", flat=True)
    
    students_profiles = Profile.objects.filter(pk__in=students).order_by("full_name")
    serializer = ProfileSerializer(students_profiles, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(["POST"])
@permission_classes([AllowAny])
def MassiveInsertionCourse(request):
    if Course.objects.exists():
        return Response(
            {"detail": "La inserción masiva de cursos ya se ha realizado anteriormente. No se pueden agregar más."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = CourseSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def MassiveInsertionSchedule(request):
    if Schedule.objects.exists():
        # 2. Si ya existen, retorna un error 400 (Bad Request)
        return Response(
            {"detail": "La inserción masiva de programas de cursos ya se ha realizado anteriormente. No se pueden agregar más."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = ScheduleSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def MassiveInsertionEnrollment(request):
    schedule_id = request.data.get("schedule_id")
    print(schedule_id)
    if schedule_id is None:
        return Response(
            {"error": "Id de la materia no asignada"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        schedule = Schedule.objects.get(pk=schedule_id)
    except Schedule.DoesNotExist:
        return Response(
            {"error": "Materia inexistente"}, status=status.HTTP_404_NOT_FOUND
        )

    students = Profile.objects.filter(user_type="STUDENT")
    enrollments = []
    for s in students:
        enrollments.append(
            {"schedule_id": schedule.id, "status": "ACTIVE", "student_id": s.id}
        )
    serializer = EnrollmentSerializer(data=enrollments, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

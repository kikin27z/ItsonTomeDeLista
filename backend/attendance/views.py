from datetime import datetime

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from academic.models import Schedule
from users.models import Profile
from utils.config import WIFI_ADDRESS
from utils.file_handler import ExcelAttendanceExporter, CSVAttendanceExporter, PDFAttendanceExporter
from utils.wifi_detector import get_client_ip, ip_in_range
from .models import ClassSession,AttendanceRecord
from .serializers import AttendanceRecordSerializer, ClassSessionDetailSerializer, RegisterAttendanceSerializer, \
    AttendanceHistorySerializer, AttendanceHistoryListSerializer


@api_view(["POST"])
def CreateNewClassSession(request,schedule_id):
    #verificar si existe la clase
    schedule_obj = get_object_or_404(Schedule, id=schedule_id)

    # A partir de una schedule id validar si las fechas permiten crear la clase
    if not schedule_obj.is_active_now():
        return Response({"error": "El programa no esta en su horario para el pase de lista"}, status=status.HTTP_400_BAD_REQUEST)

    # Validar que no ya se haya creado ya la sesion
    if ClassSession.has_session_today(schedule_obj):
        return Response({"error": "Ya se creo una sesion para la clase de hoy"}, status=status.HTTP_400_BAD_REQUEST)
    #crear un codigo unico
    try:
        # All the complex logic is now in one safe call
        new_session = ClassSession.create_new_session(schedule_obj)
    except Exception as e:
        # Catch any failure from the transaction
        return Response(
            {"error": f"Error al crear la sesión: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    serializer = ClassSessionDetailSerializer(new_session)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PUT"])
def ClosedClassSession(request,session_id):
    class_session = get_object_or_404(ClassSession, id=session_id)
    # if not class_session.is_active_now():
    #     return Response({"error": "El programa no esta en su horario para cerrar la sesion"},
    #                     status=status.HTTP_400_BAD_REQUEST)

    class_session.status = "CLOSED"
    class_session.save()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["PUT"])
def ActivatedClassSession(request,session_id):
    class_session = get_object_or_404(ClassSession, id=session_id)

    class_session.status = "ACTIVE"
    class_session.save()

    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["GET"])
def GetAttendaceByStudent(request,student_username):
    student = get_object_or_404(Profile, unique_id=student_username)

    date_range = request.GET.get('range_date', 'last_week')
    schedule_id = request.GET.get('schedule_id', None)

    attendances = AttendanceRecord.student_attendace_history(student, schedule_id, date_range)
    serializer = AttendanceHistorySerializer(attendances, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
def GetAttendaceByTeacher(request,teacher_username):
    teacher = get_object_or_404(Profile, username=teacher_username)
    pass


@api_view(["GET"])
def GetClassSession(request, schedule_id):
    schedule_obj = get_object_or_404(Schedule, id=schedule_id)
    session = schedule_obj.get_today_session()
    if session is None:
        return Response({"error": "No se ha creado una nueva sesion hoy"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(ClassSessionDetailSerializer(session).data, status=status.HTTP_200_OK)


@api_view(["POST"])
def RegisterAttendance(request):
    # Validar IP del cliente contra rango permitido
    # user_ip = get_client_ip(request)
    # ip_permitida = "192.168.1.0/24"  # Cambiar por el rango correcto de la red del servidor
    #
    # if not ip_in_range(user_ip, ip_permitida):
    #     return Response({"error": "Acceso denegado desde esta red."}, status=status.HTTP_403_FORBIDDEN)

    # Verificar que existe alguna session con el codigo
    # Verificar que ese codigo el alumno este inscrito
    #Verifficar que la sesion este activa
    # devolver respuesta
    serializer = RegisterAttendanceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    code = serializer.validated_data.get('attendance_code')
    student_id = serializer.validated_data.get('student_id')

    attendance = AttendanceRecord.student_enrolled_in_session_today(code, student_id)
    if not attendance :
        return Response({"error": "El estudiante no esta registrado a ninguna sesion de clase hoy con ese codigo"},
                        status=status.HTTP_400_BAD_REQUEST)
    session = attendance.class_session

    if session.status != "ACTIVE":
        return Response({"error": "La clase esta inactiva o no esta registrada a la clase de hoy"},
                        status=status.HTTP_400_BAD_REQUEST)

    if attendance.status == "PRESENT":
        return Response({"error": "El estudiante ya esta registrado a esta clase"},
                        status=status.HTTP_400_BAD_REQUEST)


    attendance.registration_datetime = datetime.now()
    attendance.status = "PRESENT"
    attendance.save()
    return Response(AttendanceRecordSerializer(attendance).data, status.HTTP_200_OK)


@api_view(["GET"])
def GetAttendanceFromSession(request,session_id):
    class_session = get_object_or_404(ClassSession, id=session_id)

    status_class = request.GET.get("status")
    valid_statuses = [choice[0] for choice in AttendanceRecord.STATUS_CHOICES]
    if status_class in valid_statuses:
        attendance = class_session.get_attendances(status_class)
    else:
        attendance = class_session.get_attendances()

    serializer = AttendanceRecordSerializer(attendance, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
def test_wifi(request):
    user_ip = get_client_ip(request)
    ip_permitida = WIFI_ADDRESS  # Cambiar por el rango correcto de la red del servidor

    if not ip_in_range(user_ip, ip_permitida):
        return Response({"error": "Acceso denegado desde esta red."}, status=status.HTTP_403_FORBIDDEN)

    return Response(status=status.HTTP_200_OK)

from rest_framework.views import APIView
from rest_framework.response import Response

class AttendanceHistoryView(APIView):
    def get(self, request, schedule_id):
        schedule = get_object_or_404(Schedule, id=schedule_id)
        data = AttendanceRecord.get_attendance_history_by_schedule(schedule)

        records_serializer = AttendanceHistoryListSerializer(data['records'], many=True)

        return Response({
            'headers': data['headers'],
            'records': records_serializer.data
        })

class AttendanceExportViewPDF(APIView):
    """Vista genérica para exportar asistencias en diferentes formatos"""

    def get(self, request, schedule_id):
        # Obtener formato solicitado (default: excel)
        # Seleccionar exportador según formato
        schedule = get_object_or_404(Schedule, id=schedule_id)
        data = AttendanceRecord.get_attendance_history_by_schedule(schedule)
        exporter = PDFAttendanceExporter(data)
        # Exportar
        return exporter.export(schedule_id=schedule_id)

class AttendanceExportViewEXCEL(APIView):
    """Vista genérica para exportar asistencias en diferentes formatos"""

    def get(self, request, schedule_id):
        # Obtener formato solicitado (default: excel)
        # Seleccionar exportador según formato
        schedule = get_object_or_404(Schedule, id=schedule_id)
        data = AttendanceRecord.get_attendance_history_by_schedule(schedule)
        exporter = ExcelAttendanceExporter(data)
        # Exportar
        return exporter.export(schedule_id=schedule_id)

class AttendanceExportViewCSV(APIView):
    """Vista genérica para exportar asistencias en diferentes formatos"""

    def get(self, request, schedule_id):
        # Obtener formato solicitado (default: excel)
        # Seleccionar exportador según formato
        schedule = get_object_or_404(Schedule, id=schedule_id)

        export_format = request.GET.get('format', 'excel')

        # Obtener datos
        data = AttendanceRecord.get_attendance_history_by_schedule(schedule)

        exporter = CSVAttendanceExporter(data)

        # Exportar
        return exporter.export(schedule_id=schedule_id)
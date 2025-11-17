from datetime import datetime
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from academic.models import Schedule
from .models import ClassSession, AttendanceRecord
from .serializers import AttendanceRecordSerializer, ClassSessionDetailSerializer, RegisterAttendanceSerializer


# Create your views here.


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


@api_view(["GET"])
def GetClassSession(request, schedule_id):
    schedule_obj = get_object_or_404(Schedule, id=schedule_id)
    session = schedule_obj.get_today_session()
    if session is None:
        return Response({"error": "No se ha creado una nueva sesion hoy"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(ClassSessionDetailSerializer(session).data, status=status.HTTP_200_OK)


@api_view(["POST"])
def RegisterAttendance(request):

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
    
    # aquí valido que el usuario autenticado es el profesor de esta clase
    if class_session.schedule.teacher != request.user.profile:
        return Response(
            {"error": "No tienes permiso para ver la asistencia de esta clase"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Obtener filtro de estado (opcional)
    status_filter = request.GET.get("status")
    valid_statuses = [choice[0] for choice in AttendanceRecord.STATUS_CHOICES]
    
    if status_filter and status_filter not in valid_statuses:
        return Response(
            {"error": f"Estado inválido. Opciones válidas: {valid_statuses}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # en esta parte obtengo los registros de asistencia
    if status_filter:
        attendance_records = class_session.get_attendances(status_filter)
    else:
        attendance_records = class_session.get_attendances()
    
    # aquí calculo las estadísticas
    total_students = class_session.students_count()
    present_count = class_session.get_attendances("PRESENT").count()
    late_count = class_session.get_attendances("LATE").count()
    justified_count = class_session.get_attendances("JUSTIFIED").count()
    absent_count = class_session.get_attendances("ABSENT").count()
    
    serializer = AttendanceRecordSerializer(attendance_records, many=True)
    
    # esto es lo que devuelvo en la respuesta
    return Response({
        "session": {
            "id": class_session.id,
            "attendance_code": class_session.attendance_code,
            "status": class_session.status,
            "actual_start_time": class_session.actual_start_time,
        },
        "statistics": {
            "total_students": total_students,
            "present": present_count,
            "late": late_count,
            "justified": justified_count,
            "absent": absent_count,
        },
        "attendance_list": serializer.data,
    }, status=status.HTTP_200_OK)

# este metodo si es que se le puede llamar metodo es lo del historial de sesiones
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def GetSessionsHistory(request, schedule_id):
    schedule = get_object_or_404(Schedule, id=schedule_id)
    
    # aquí valido que el usuario autenticado es el profesor
    if schedule.teacher != request.user.profile:
        return Response(
            {"error": "No tienes permiso para ver el historial de esta clase"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # aquí obtengo todas las sesiones de la clase
    sessions = ClassSession.objects.filter(schedule=schedule).order_by('-actual_start_time')
    
    sessions_data = []
    for session in sessions:
        total = session.stu()
        present = session.get_attendances("PRESENT").count()
        
        sessions_data.append({
            "id": session.id,
            "date": session.actual_start_time,
            "status": session.status,
            "attendance_code": session.attendance_code,
            "attendance_rate": f"{(present/total*100):.1f}%" if total > 0 else "0%",
            "present_count": present,
            "total_students": total,
        })
    
    return Response({
        "schedule_id": schedule_id,
        "class_name": f"{schedule.subject.name}",
        "sessions": sessions_data,
    }, status=status.HTTP_200_OK)

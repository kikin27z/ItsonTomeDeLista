from django.urls import path
from .views import CreateNewClassSession, GetClassSession, GetAttendanceFromSession, RegisterAttendance, test_wifi, \
    ClosedClassSession, ActivatedClassSession

urlpatterns = [
    path('class-session/<int:schedule_id>/new', CreateNewClassSession, name='create-new-class-session' ),
    path('class-session/<int:schedule_id>/today', GetClassSession, name='get-class-session'),
    path('class-session/<int:session_id>/attendances', GetAttendanceFromSession, name='get-class-session'),
    path('class-session/register', RegisterAttendance, name='register-class-session'),
    path('class-session/<int:session_id>/closed', ClosedClassSession, name='closed-class-session'),
    path('class-session/<int:session_id>/active', ActivatedClassSession, name='activated-class-session'),
    path('attendance/student/<int:student_id>', ActivatedClassSession, name='filter-attendace-student'),
    path('attendance/teacher/<int:teacher_id>', ActivatedClassSession, name='filter-attendance-teacher'),
    path('test-wifi', test_wifi, name='test-wifi')
]

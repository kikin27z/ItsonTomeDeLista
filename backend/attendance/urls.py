from django.urls import path
from .views import CreateNewClassSession, GetClassSession, GetAttendanceFromSession, RegisterAttendance,GetSessionsHistory

urlpatterns = [
    path('class-session/<int:schedule_id>/new', CreateNewClassSession, name='create-new-class-session' ),
    path('class-session/<int:schedule_id>/today', GetClassSession, name='get-class-session'),
    path('<int:session_id>/attendances', GetAttendanceFromSession, name='get-class-session'),
    path('class-session/register', RegisterAttendance, name='register-class-session'),
    path('sessions-history/<int:schedule_id>/', GetSessionsHistory, name="get-sessions-history")
]

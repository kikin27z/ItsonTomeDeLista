from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register your viewset
router = DefaultRouter()
router.register(r"courses", views.CourseViewSet, basename="course")

# Include the router’s URLs
urlpatterns = [
    path("courses/massive/",views.MassiveInsertionCourse, name="massive-insertion-course",), 
    path("schedules/massive/", views.MassiveInsertionSchedule, name="massive-insertion-schedule",),
    path("schedules/assigned/", views.GetScheduleById, name="schedules-assigned-teacher"),
    path("schedules/<str:schedule_id>/student", views.GetStudentsFromSchedule,name="schedule-student-list",),
    path("schedules/<str:teacher_id>/list/", views.GetScheduleById,name="schedules-assigned-teacher",),
    path("schedules/<str:id>/", views.GetScheduleDetail, name="schedule-in-detail",),
    path( "enrollments/massive/", views.MassiveInsertionEnrollment, name="massive-insertion-enrollment",),
    path( "enrollments/student/<str:student_username>", views.GetScheduleByStudent,name="shedule-enrollment-student",), #falta de testear
    path("", include(router.urls)), #falta de testear
]

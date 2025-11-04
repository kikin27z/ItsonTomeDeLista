from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register your viewset
router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')

# Include the router’s URLs
urlpatterns = [
    path('courses/massive/', views.MassiveInsertionCourse, name='massive-insertion-course'),
    path('schedules/massive/', views.MassiveInsertionSchedule, name='massive-insertion-schedule'),
    path('enrollments/massive/', views.MassiveInsertionEnrollment, name='massive-insertion-enrollment'),
    path('', include(router.urls)),
]

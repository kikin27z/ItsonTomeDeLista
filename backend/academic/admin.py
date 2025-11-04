from django.contrib import admin
from .models import Course, Schedule, Enrollment
from users.models import Profile
admin.site.register(Course)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('course', 'teacher', 'academic_period', 'days_of_week')
    list_filter = ('academic_period', 'teacher')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):  
      if db_field.name == 'teacher':  
        # Asignamos nuestro queryset personalizado
        kwargs['queryset'] = Profile.objects.filter(user_type='TEACHER')
          
      # Devolvemos el resultado del método padre con nuestros cambios
      return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'schedule', 'status')
    list_filter = ('schedule', 'student')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):  
      if db_field.name == 'student':
        kwargs['queryset'] = Profile.objects.filter(user_type='STUDENT')
      return super().formfield_for_foreignkey(db_field, request, **kwargs)

from django.contrib import admin
from .models import *
# Pro tip to see the many to many relationships
# @admin.register(ClassSession)
# class ClassSessionAdmin(admin.ModelAdmin):
#   filter_horizontal = ["relation"]

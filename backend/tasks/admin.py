from django.contrib import admin
from .models import Task, TaskCompletion


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "frequency", "group", "created_by", "is_default", "is_active"]
    list_filter = ["category", "frequency", "is_default", "is_active"]
    search_fields = ["title"]


@admin.register(TaskCompletion)
class TaskCompletionAdmin(admin.ModelAdmin):
    list_display = ["user", "task", "count", "completed_at"]
    list_filter = ["completed_at"]
    date_hierarchy = "completed_at"
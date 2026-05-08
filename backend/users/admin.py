from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Group


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "phone", "whatsapp_enabled", "is_staff"]
    list_filter = ["whatsapp_enabled", "is_staff"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Extra", {"fields": ("phone", "avatar", "whatsapp_enabled")}),
    )


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ["name", "admin", "invite_code", "created_at"]
    filter_horizontal = ["members"]
    readonly_fields = ["invite_code"]

from rest_framework import serializers
from django.utils import timezone
from .models import Task, TaskCompletion
from users.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    user_completion_today = serializers.SerializerMethodField()
    total_completions_today = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "group", "assigned_to", "created_by", "title", "description",
            "category", "frequency", "target_count", "is_default",
            "is_active", "due_date", "created_at",
            "user_completion_today", "total_completions_today",
        ]
        read_only_fields = ["id", "created_by", "created_at"]

    def get_user_completion_today(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        today = timezone.now().date()
        completion = obj.completions.filter(user=request.user, completed_at__date=today).first()
        if completion:
            return TaskCompletionSerializer(completion).data
        return None

    def get_total_completions_today(self, obj):
        today = timezone.now().date()
        return obj.completions.filter(completed_at__date=today).values("user").distinct().count()


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["title", "description", "category", "frequency", "target_count", "is_default", "due_date", "group", "assigned_to"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class TaskCompletionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskCompletion
        fields = ["id", "task", "user", "count", "note", "completed_at"]
        read_only_fields = ["id", "user", "completed_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class TodayStatsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    completion_percent = serializers.IntegerField()
    streak = serializers.IntegerField()

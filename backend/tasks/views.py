from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Task, TaskCompletion
from .serializers import (
    TaskSerializer, TaskCreateSerializer,
    TaskCompletionSerializer, TodayStatsSerializer,
)


class TaskListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == "POST":
            return TaskCreateSerializer
        return TaskSerializer

    def get_queryset(self):
        user = self.request.user
        group_id = self.request.query_params.get("group")
        today = timezone.now().date()

        qs = Task.objects.filter(
            Q(group__members=user) | Q(created_by=user),
            is_active=True,
        ).distinct()

        if group_id:
            qs = qs.filter(group_id=group_id)

        # Filter by frequency
        freq = self.request.query_params.get("frequency")
        if freq:
            qs = qs.filter(frequency=freq)

        return qs.select_related("created_by", "group")


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return TaskCreateSerializer
        return TaskSerializer

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(group__members=user) | Q(created_by=user)
        ).distinct()


@api_view(["POST"])
def mark_complete(request, task_id):
    """Mark a task as complete for today. If already marked, updates the count/note."""
    try:
        task = Task.objects.get(
            pk=task_id,
            is_active=True,
        )
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    today = timezone.now().date()
    completion, created = TaskCompletion.objects.get_or_create(
        task=task,
        user=request.user,
        completed_at__date=today,
        defaults={
            "count": request.data.get("count", task.target_count),
            "note": request.data.get("note", ""),
        },
    )

    if not created:
        completion.count = request.data.get("count", completion.count)
        completion.note = request.data.get("note", completion.note)
        completion.save()

    return Response(
        TaskCompletionSerializer(completion).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["DELETE"])
def unmark_complete(request, task_id):
    today = timezone.now().date()
    deleted, _ = TaskCompletion.objects.filter(
        task_id=task_id,
        user=request.user,
        completed_at__date=today,
    ).delete()
    if deleted:
        return Response({"message": "Unmarked."})
    return Response({"error": "No completion found for today."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def today_stats(request):
    user = request.user
    group_id = request.query_params.get("group")
    today = timezone.now().date()

    task_qs = Task.objects.filter(
        Q(group__members=user) | Q(created_by=user),
        is_active=True,
        frequency__in=["daily"],
    ).distinct()

    if group_id:
        task_qs = task_qs.filter(group_id=group_id)

    total = task_qs.count()
    completed_ids = TaskCompletion.objects.filter(
        user=user,
        task__in=task_qs,
        completed_at__date=today,
    ).values_list("task_id", flat=True)
    completed = len(set(completed_ids))

    return Response({
        "total_tasks": total,
        "completed_tasks": completed,
        "completion_percent": round((completed / total) * 100) if total else 0,
        "streak": user.current_streak,
    })


@api_view(["GET"])
def completion_history(request):
    user = request.user
    task_id = request.query_params.get("task")
    qs = TaskCompletion.objects.filter(user=user).order_by("-completed_at")
    if task_id:
        qs = qs.filter(task_id=task_id)
    return Response(TaskCompletionSerializer(qs[:30], many=True).data)


@api_view(["POST"])
def seed_default_tasks(request, group_id):
    """Seed default tasks for a group (admin only)."""
    from users.models import Group
    try:
        group = Group.objects.get(pk=group_id, admin=request.user)
    except Group.DoesNotExist:
        return Response({"error": "Only group admin can seed tasks."}, status=403)

    defaults = [
        {"title": "2 DSA Problems", "category": "dsa", "target_count": 2, "frequency": "daily"},
        {"title": "Watch Course Lecture", "category": "course", "target_count": 1, "frequency": "daily"},
        {"title": "Work on Project (1hr)", "category": "project", "target_count": 1, "frequency": "daily"},
        {"title": "Revision / Notes", "category": "revision", "target_count": 1, "frequency": "daily"},
    ]

    created = []
    for d in defaults:
        task, was_created = Task.objects.get_or_create(
            group=group,
            title=d["title"],
            defaults={**d, "created_by": request.user, "is_default": True},
        )
        if was_created:
            created.append(task.title)

    return Response({"created": created, "message": f"{len(created)} default tasks added."})

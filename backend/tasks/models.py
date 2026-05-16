from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Task(models.Model):
    CATEGORY_CHOICES = [
        ("dsa", "DSA Problems"),
        ("course", "Course / Lectures"),
        ("project", "Project Work"),
        ("revision", "Revision"),
        ("mock", "Mock Interview"),
        ("other", "Other"),
    ]
    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("once", "One Time"),
    ]

    group = models.ForeignKey(
        "users.Group", on_delete=models.CASCADE, related_name="tasks", null=True, blank=True
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="assigned_tasks", null=True, blank=True,
        help_text="Specific user this task is assigned to (for personal or targeted tasks)"
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default="daily")
    target_count = models.PositiveIntegerField(default=1, help_text="e.g. 2 for '2 DSA problems'")
    is_default = models.BooleanField(default=False, help_text="Auto-assigned to all group members")
    is_active = models.BooleanField(default=True)
    due_date = models.DateField(null=True, blank=True, help_text="For one-time tasks")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"


class TaskCompletion(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="completions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completions")
    count = models.PositiveIntegerField(default=1, help_text="How many units completed (e.g. 2 problems)")
    note = models.TextField(blank=True, help_text="Optional note like LeetCode problem links")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.username} completed {self.task.title}"

    @property
    def is_fully_done(self):
        return self.count >= self.task.target_count


class DailyProgress(models.Model):
    """Cached daily progress per user per group for quick leaderboard queries."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey("users.Group", on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField()
    tasks_completed = models.PositiveIntegerField(default=0)
    tasks_total = models.PositiveIntegerField(default=0)

    class Meta:
        pass

    @property
    def completion_percent(self):
        if self.tasks_total == 0:
            return 0
        return round((self.tasks_completed / self.tasks_total) * 100)

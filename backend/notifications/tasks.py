from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


@shared_task
def send_morning_reminders():
    """Send morning WhatsApp reminders to all users with WhatsApp enabled. Run at 8 AM IST."""
    from users.models import Group
    from tasks.models import Task
    from .whatsapp import send_whatsapp, build_morning_message

    today = timezone.now().date()
    groups = Group.objects.prefetch_related("members")

    for group in groups:
        daily_tasks = Task.objects.filter(
            group=group, frequency="daily", is_active=True
        )
        if not daily_tasks.exists():
            continue

        for member in group.members.filter(whatsapp_enabled=True, phone__gt=""):
            message = build_morning_message(member, daily_tasks, group.name)
            send_whatsapp(member.phone, message)


@shared_task
def send_evening_reminders():
    """Send evening reminders for pending tasks. Run at 8 PM IST."""
    from users.models import Group
    from tasks.models import Task, TaskCompletion
    from .whatsapp import send_whatsapp, build_evening_reminder

    today = timezone.now().date()
    groups = Group.objects.prefetch_related("members")

    for group in groups:
        daily_tasks = Task.objects.filter(group=group, frequency="daily", is_active=True)
        if not daily_tasks.exists():
            continue

        for member in group.members.filter(whatsapp_enabled=True, phone__gt=""):
            completed_task_ids = TaskCompletion.objects.filter(
                user=member,
                task__in=daily_tasks,
                completed_at__date=today,
            ).values_list("task_id", flat=True)

            pending = daily_tasks.exclude(id__in=completed_task_ids)
            if not pending.exists():
                continue  # All done, no reminder needed

            message = build_evening_reminder(member, pending, group.name)
            send_whatsapp(member.phone, message)


@shared_task
def send_daily_summary():
    """Send a daily group summary at 11 PM IST."""
    from users.models import Group
    from tasks.models import Task, TaskCompletion
    from .whatsapp import send_whatsapp, build_completion_summary

    today = timezone.now().date()
    groups = Group.objects.prefetch_related("members")

    for group in groups:
        daily_tasks = Task.objects.filter(group=group, frequency="daily", is_active=True)
        total = daily_tasks.count()
        if total == 0:
            continue

        # Build group summary
        summary_lines = [f"📊 *Daily Summary — {group.name}*\n"]
        for member in group.members.all():
            completed = TaskCompletion.objects.filter(
                user=member,
                task__in=daily_tasks,
                completed_at__date=today,
            ).values("task_id").distinct().count()
            streak = member.current_streak
            emoji = "🔥" if completed == total else ("✅" if completed > 0 else "❌")
            summary_lines.append(f"{emoji} {member.username}: {completed}/{total} tasks")

        summary = "\n".join(summary_lines)

        # Send to all whatsapp-enabled members
        for member in group.members.filter(whatsapp_enabled=True, phone__gt=""):
            send_whatsapp(member.phone, summary)


@shared_task
def notify_task_completion(completion_id):
    """Notify group when someone completes a task."""
    from tasks.models import TaskCompletion
    from .whatsapp import send_whatsapp

    try:
        completion = TaskCompletion.objects.select_related("user", "task__group").get(pk=completion_id)
    except TaskCompletion.DoesNotExist:
        return

    group = completion.task.group
    if not group:
        return

    user = completion.user
    message = (
        f"✅ *{user.username}* just completed *{completion.task.title}* in {group.name}!"
    )

    for member in group.members.exclude(id=user.id).filter(whatsapp_enabled=True, phone__gt=""):
        send_whatsapp(member.phone, message)

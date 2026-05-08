"""
Management command to set up periodic Celery Beat tasks for reminders.
Run once: python manage.py setup_reminders
"""
from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json


class Command(BaseCommand):
    help = 'Set up daily reminder schedules in Celery Beat'

    def handle(self, *args, **options):
        # Morning reminder — 8:00 AM IST (2:30 UTC)
        morning_schedule, _ = CrontabSchedule.objects.get_or_create(
            minute='30', hour='2', day_of_week='*', day_of_month='*', month_of_year='*',
            timezone='Asia/Kolkata',
        )
        PeriodicTask.objects.update_or_create(
            name='Morning WhatsApp Reminders',
            defaults={
                'crontab': morning_schedule,
                'task': 'notifications.tasks.send_morning_reminders',
                'args': json.dumps([]),
            },
        )

        # Evening reminder — 8:00 PM IST (14:30 UTC)
        evening_schedule, _ = CrontabSchedule.objects.get_or_create(
            minute='30', hour='14', day_of_week='*', day_of_month='*', month_of_year='*',
            timezone='Asia/Kolkata',
        )
        PeriodicTask.objects.update_or_create(
            name='Evening WhatsApp Reminders',
            defaults={
                'crontab': evening_schedule,
                'task': 'notifications.tasks.send_evening_reminders',
                'args': json.dumps([]),
            },
        )

        # Daily summary — 11:00 PM IST (17:30 UTC)
        summary_schedule, _ = CrontabSchedule.objects.get_or_create(
            minute='30', hour='17', day_of_week='*', day_of_month='*', month_of_year='*',
            timezone='Asia/Kolkata',
        )
        PeriodicTask.objects.update_or_create(
            name='Daily Summary WhatsApp',
            defaults={
                'crontab': summary_schedule,
                'task': 'notifications.tasks.send_daily_summary',
                'args': json.dumps([]),
            },
        )

        self.stdout.write(self.style.SUCCESS(
            '✅ Reminders scheduled:\n'
            '   8:00 AM — Morning reminder\n'
            '   8:00 PM — Evening pending tasks\n'
            '  11:00 PM — Daily summary\n'
            'Run celery beat to activate them.'
        ))

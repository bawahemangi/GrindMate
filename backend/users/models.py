import random
import string
from django.contrib.auth.models import AbstractUser
from django.db import models


def generate_invite_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, help_text="With country code, e.g. +919876543210")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    whatsapp_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    @property
    def whatsapp_number(self):
        return f"whatsapp:{self.phone}" if self.phone else None

    @property
    def current_streak(self):
        from tasks.models import TaskCompletion
        from django.utils import timezone
        from datetime import timedelta
        streak = 0
        day = timezone.now().date() - timedelta(days=1)
        while True:
            completed = TaskCompletion.objects.filter(user=self, completed_at__date=day).exists()
            if not completed:
                break
            streak += 1
            day -= timedelta(days=1)
        return streak


class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    invite_code = models.CharField(max_length=8, unique=True, default=generate_invite_code)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name="administered_groups")
    members = models.ManyToManyField(User, related_name="groups", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def regenerate_invite_code(self):
        self.invite_code = generate_invite_code()
        self.save()

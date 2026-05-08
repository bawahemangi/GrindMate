from django.conf import settings


def send_whatsapp(to: str, message: str) -> bool:
    """
    Send a WhatsApp message via Twilio.
    `to` should be in format: +919876543210 (without 'whatsapp:' prefix)
    Returns True if sent, False otherwise.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print(f"[WhatsApp MOCK] To: {to}\n{message}\n")
        return True  # Mock success in dev

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{to}",
            body=message,
        )
        return True
    except Exception as e:
        print(f"[WhatsApp ERROR] {e}")
        return False


def build_morning_message(user, tasks, group_name):
    task_lines = "\n".join([f"  ☐ {t.title}" for t in tasks])
    return (
        f"🌅 Good morning, {user.first_name or user.username}!\n\n"
        f"Today's tasks for *{group_name}*:\n"
        f"{task_lines}\n\n"
        f"Let's grind! 💪\n"
        f"Mark done: {settings.FRONTEND_URL}"
    )


def build_evening_reminder(user, pending_tasks, group_name):
    task_lines = "\n".join([f"  ⏳ {t.title}" for t in pending_tasks])
    return (
        f"🌙 Evening check-in, {user.first_name or user.username}!\n\n"
        f"Still pending in *{group_name}*:\n"
        f"{task_lines}\n\n"
        f"You've got this! Go finish them 🔥\n"
        f"{settings.FRONTEND_URL}"
    )


def build_completion_summary(user, completed, total, group_name, streak):
    emoji = "🔥" if streak > 3 else "✅"
    return (
        f"{emoji} *{user.first_name or user.username}* completed {completed}/{total} tasks today "
        f"in *{group_name}*! "
        f"(Streak: {streak} days)"
    )

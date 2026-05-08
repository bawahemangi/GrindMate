from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tasks import send_morning_reminders, send_evening_reminders, send_daily_summary
from .whatsapp import send_whatsapp


@api_view(["POST"])
def test_whatsapp(request):
    """Test WhatsApp sending for the logged-in user."""
    user = request.user
    if not user.phone:
        return Response({"error": "No phone number set on your profile."}, status=400)

    sent = send_whatsapp(
        user.phone,
        f"👋 Hey {user.username}! Your GrindTracker WhatsApp reminders are working perfectly. Let's get to work! 💪",
    )
    if sent:
        return Response({"message": f"Test message sent to {user.phone}"})
    return Response({"error": "Failed to send. Check Twilio credentials."}, status=500)


@api_view(["POST"])
def trigger_morning(request):
    """Manually trigger morning reminders (admin only)."""
    if not request.user.is_staff:
        return Response({"error": "Admin only."}, status=403)
    send_morning_reminders.delay()
    return Response({"message": "Morning reminders queued."})


@api_view(["POST"])
def trigger_evening(request):
    """Manually trigger evening reminders (admin only)."""
    if not request.user.is_staff:
        return Response({"error": "Admin only."}, status=403)
    send_evening_reminders.delay()
    return Response({"message": "Evening reminders queued."})


@api_view(["POST"])
def trigger_summary(request):
    """Manually trigger daily summary (admin only)."""
    if not request.user.is_staff:
        return Response({"error": "Admin only."}, status=403)
    send_daily_summary.delay()
    return Response({"message": "Daily summary queued."})

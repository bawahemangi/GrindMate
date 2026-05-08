from django.urls import path
from . import views

urlpatterns = [
    path("test-whatsapp/", views.test_whatsapp, name="test-whatsapp"),
    path("trigger/morning/", views.trigger_morning, name="trigger-morning"),
    path("trigger/evening/", views.trigger_evening, name="trigger-evening"),
    path("trigger/summary/", views.trigger_summary, name="trigger-summary"),
]

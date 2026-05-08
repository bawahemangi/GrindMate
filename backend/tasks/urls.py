from django.urls import path
from . import views

urlpatterns = [
    path("", views.TaskListCreateView.as_view(), name="task-list"),
    path("<int:pk>/", views.TaskDetailView.as_view(), name="task-detail"),
    path("<int:task_id>/complete/", views.mark_complete, name="mark-complete"),
    path("<int:task_id>/uncomplete/", views.unmark_complete, name="unmark-complete"),
    path("today/stats/", views.today_stats, name="today-stats"),
    path("history/", views.completion_history, name="completion-history"),
    path("groups/<int:group_id>/seed/", views.seed_default_tasks, name="seed-tasks"),
]

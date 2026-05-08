from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Group
from .serializers import UserSerializer, RegisterSerializer, GroupSerializer, GroupCreateSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class GroupListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == "POST":
            return GroupCreateSerializer
        return GroupSerializer

    def get_queryset(self):
        return self.request.user.groups.all()


class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroupSerializer

    def get_queryset(self):
        return self.request.user.groups.all()


@api_view(["POST"])
def join_group(request):
    invite_code = request.data.get("invite_code", "").upper().strip()
    try:
        group = Group.objects.get(invite_code=invite_code)
    except Group.DoesNotExist:
        return Response({"error": "Invalid invite code."}, status=status.HTTP_400_BAD_REQUEST)

    if request.user in group.members.all():
        return Response({"message": "Already a member.", "group": GroupSerializer(group).data})

    group.members.add(request.user)
    return Response({"message": "Joined successfully!", "group": GroupSerializer(group).data})


@api_view(["POST"])
def leave_group(request, pk):
    try:
        group = Group.objects.get(pk=pk)
    except Group.DoesNotExist:
        return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

    if group.admin == request.user:
        return Response({"error": "Admin cannot leave. Transfer admin or delete group."}, status=status.HTTP_400_BAD_REQUEST)

    group.members.remove(request.user)
    return Response({"message": "Left the group."})


@api_view(["GET"])
def group_leaderboard(request, pk):
    try:
        group = Group.objects.get(pk=pk, members=request.user)
    except Group.DoesNotExist:
        return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

    from tasks.models import TaskCompletion
    from django.utils import timezone
    from django.db.models import Count

    today = timezone.now().date()
    start_of_month = today.replace(day=1)

    leaderboard = []
    for member in group.members.all():
        completions_today = TaskCompletion.objects.filter(
            user=member, completed_at__date=today
        ).count()
        completions_month = TaskCompletion.objects.filter(
            user=member, completed_at__date__gte=start_of_month
        ).count()
        leaderboard.append({
            "user": UserSerializer(member).data,
            "completions_today": completions_today,
            "completions_month": completions_month,
            "streak": member.current_streak,
        })

    leaderboard.sort(key=lambda x: x["completions_month"], reverse=True)
    return Response(leaderboard)

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    current_streak = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "avatar", "whatsapp_enabled", "current_streak", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password", "phone"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            phone=validated_data.get("phone", ""),
        )
        return user


class GroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    admin = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "description", "invite_code", "admin", "members", "member_count", "created_at"]
        read_only_fields = ["id", "invite_code", "admin", "created_at"]

    def get_member_count(self, obj):
        return obj.members.count()


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["name", "description"]

    def create(self, validated_data):
        user = self.context["request"].user
        group = Group.objects.create(admin=user, **validated_data)
        group.members.add(user)
        return group

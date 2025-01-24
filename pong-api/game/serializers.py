from rest_framework import serializers
from .models import GameState


class GameStateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = GameState
        fields = (
            "id",
            "max_score",
            "is_game_running",
            "is_game_ended",
            "player_1_id",
            "player_2_id",
            "player_1_name",
            "player_2_name",
            "player_1_score",
            "player_2_score",
            "player_1_position",
            "player_2_position",
            "ball_x_position",
            "ball_y_position",
            "ball_x_direction",
            "ball_y_direction",
            "game_height",
            "game_width",
            "paddle_height",
            "paddle_width",
        )

    def validate(self, data):
        if "player_1_id" not in data or "player_2_id" not in data:
            raise serializers.ValidationError(
                "Both player_1_id and player_2_id are required."
            )
        if "player_1_name" not in data or "player_2_name" not in data:
            raise serializers.ValidationError(
                "Both player_1_name and player_2_name are required."
            )
        return data

    def create(self, validated_data):
        validated_data.setdefault("ball_x_position", 290)
        validated_data.setdefault("ball_y_position", 190)
        validated_data.setdefault("ball_x_direction", 3)
        validated_data.setdefault("ball_y_direction", 3)
        validated_data.setdefault("player_1_position", 160)  # Default middle position
        validated_data.setdefault("player_2_position", 160)  # Default middle position
        validated_data.setdefault("player_1_score", 0)  # Default score
        validated_data.setdefault("player_2_score", 0)  # Default score
        validated_data.setdefault("game_height", 400)  # Fixed default size
        validated_data.setdefault("game_width", 600)  # Fixed default size
        validated_data.setdefault("paddle_height", 80)  # Fixed default size
        validated_data.setdefault("paddle_width", 20)  # Fixed default size
        return super().create(validated_data)

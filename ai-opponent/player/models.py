import json
from django.db import models
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class AIPlayer(models.Model):
    id = models.IntegerField()
    target_game_id = models.IntegerField()

    # Overloaded functions for Redis use
    def save(self, *args, **kwargs):
        if settings.USE_REDIS:
            cache_key = f"ai_player_{self.id}"
            ai_player_data = {
                "id": self.id,
                "target_game_id": self.target_game_id,
            }
            cache.set(cache_key, json.dumps(ai_player_data), timeout=None)
            logger.info(f"Saved AI player to cache with key {cache_key}")
        else:
            super().save(*args, **kwargs)
            logger.info(f"Saved AI player to database with id {self.id}")

    def delete(self, *args, **kwargs):
        if settings.USE_REDIS:
            cache_key = f"ai_player_{self.id}"
            cache.delete(cache_key)
            logger.info(f"Deleted AI player from cache with key {cache_key}")
        super().delete(*args, **kwargs)

    @classmethod
    def from_cache(cls, player_id):
        cache_key = f"ai_player_{player_id}"
        ai_player_data = cache.get(cache_key)
        if ai_player_data:
            if isinstance(ai_player_data, str):
                ai_player_dict = json.loads(ai_player_data)
            else:
                ai_player_dict = {
                    k: v
                    for k, v in ai_player_data.__dict__.items()
                    if not k.startswith("_")
                }
            return cls(**ai_player_dict)
        return None

    def __str__(self):
        return f"AIPlayer(id={self.id}, target_game_id={self.target_game_id})"

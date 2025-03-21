from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("game/", include("game.urls")),  # Include the game app's URLs
]

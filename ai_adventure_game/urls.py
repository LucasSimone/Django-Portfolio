from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='adventure_game-home'),
    path('game', views.game, name='adventure_game-game'),
]
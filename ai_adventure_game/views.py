from django.shortcuts import render
from django.http import HttpResponse

from django.conf import settings


def home(request):
    context = {
        'title': 'Adventure',
    }
    
    return render(request, 'ai_adventure_game/pages/home.html', context)

def game(request):
    context = {
        'title': 'Adventure',
    }
    
    return render(request, 'ai_adventure_game/pages/game.html', context)

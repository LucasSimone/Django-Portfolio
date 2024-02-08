from django.shortcuts import render
from django.http import HttpResponse



def home(request):
    context = {
        'title': 'NN',
    }
    
    return render(request, 'negative_news/pages/home.html')

def tool(request):
    context = {
        'title': 'NN',
    }

    return render(request, 'negative_news/pages/tool.html', context)

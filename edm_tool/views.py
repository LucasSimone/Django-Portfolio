from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def home(request):
    context = {
        'title': 'Projects',
    }
    return render(request, 'edm_tool/pages/home.html', context)

def code(request):
    context = {
        'title': 'Code',
        'skeleton': render(request, 'edm_tool/skeleton/edm-skeleton.html'),
    }
    return render(request, 'edm_tool/pages/code.html', context)

def editor(request):
    context = {
        'title': 'Editor',
    }
    return render(request, 'edm_tool/pages/editor.html', context)

def canvas(request):
    context = {
        'title': 'Canvas',
    }
    return render(request, 'edm_tool/pages/canvas.html', context)

def skeleton(request):
    return render(request, 'edm_tool/skeleton/edm-skeleton.html')

def default_html(request):
    return render(request, 'edm_tool/skeleton/default.html')
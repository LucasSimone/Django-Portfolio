from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='edm_tool-home'),
    path('code', views.code, name='edm_tool-code'),
    path('editor', views.editor, name='edm_tool-editor'),
    path('canvas', views.canvas, name='edm_tool-canvas'),
    path('edm-skeleton', views.skeleton, name='edm_tool-skeleton'),
]
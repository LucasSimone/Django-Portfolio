from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='negative_news-home'),
    path('tool', views.tool, name='negative_news-tool'),
]
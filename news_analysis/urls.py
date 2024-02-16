from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='news_analysis-home'),
    path('analysis', views.analysis, name='news_analysis-analysis'),
]
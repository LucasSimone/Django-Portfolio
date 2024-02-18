from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='site-home'),
    path('projects/', views.projects, name='site-projects'),
    path('resume/', views.resume, name='site-resume'),
    # path('about/', views.about, name='site-about'),
    path('contact/', views.contact, name='site-contact'),
    path('references/', views.references, name='site-references'),
    path('geolocate/', views.geolocate, name='site-geolocate'),
    path('gallery/', views.gallery, name='site-gallery'),
]
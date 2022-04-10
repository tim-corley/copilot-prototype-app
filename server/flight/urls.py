from django.urls import path
from . import views

urlpatterns = [
    path('airports/', views.getAllAirports, name='airports'),
]
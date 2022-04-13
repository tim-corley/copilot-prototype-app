from django.urls import path
from . import views

urlpatterns = [
    path('airports/', views.get_all_airports, name='get_all_airports'),
    path('airport/new/', views.create_airport, name='create_airport'),
    path('airport/', views.get_closest_airports, name='get_closest_airport'),
    path('airport/<str:pk>/', views.get_airport, name='get_airport'),
    path('planes/', views.get_all_planes, name='get_all_planes'),
    path('planes/new/', views.create_plane, name='create_plane'),
    path('planes/<str:pk>/', views.get_plane, name='get_plane'),
    path('duty/new/', views.create_duty, name='create_duty'),
    path('leg/new/', views.create_leg, name='create_leg'),
    path('receipt/upload/', views.upload_receipt, name='upload_receipt'),
]
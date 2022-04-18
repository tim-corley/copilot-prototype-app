from django.urls import path
from . import views

urlpatterns = [
    path('airports/', views.get_all_airports, name='get_all_airports'),
    path('airport/new/', views.create_airport, name='create_airport'),
    path('airport/<str:pk>/update/', views.update_airport, name='update_airport'),
    path('airport/<str:pk>/delete/', views.delete_airport, name='delete_airport'),
    path('airport/', views.get_closest_airports, name='get_closest_airport'),
    path('airport/<str:pk>/', views.get_airport, name='get_airport'),
    path('planes/', views.get_all_planes, name='get_all_planes'),
    path('plane/new/', views.create_plane, name='create_plane'),
    path('plane/<str:pk>/update/', views.update_plane, name='update_plane'),
    path('plane/<str:pk>/delete/', views.delete_plane, name='delete_plane'),
    path('plane/<str:pk>/', views.get_plane, name='get_plane'),
    path('duty/new/', views.create_duty, name='create_duty'),
    path('duty/<str:pk>/update/', views.update_duty, name='update_duty'),
    path('duty/<str:pk>/delete/', views.delete_duty, name='delete_duty'),
    path('duty/<str:pk>/', views.get_duty, name='get_duty'),
    path('leg/new/', views.create_leg, name='create_leg'),
    path('receipt/upload/', views.upload_receipt, name='upload_receipt'),
]
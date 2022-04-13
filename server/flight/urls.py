from django.urls import path
from . import views

urlpatterns = [
    path('airports/', views.getAllAirports, name='get_airports'),
    path('airport/', views.getClosestAirports, name='get_airport'),
    path('planes/', views.getAllPlanes, name='get_planes'),
    path('receipt/upload/', views.uploadReceipt, name='upload_receipt'),
    path('duty/new/', views.createDuty, name='create_duty'),
    path('leg/new/', views.createLeg, name='create_leg')
]
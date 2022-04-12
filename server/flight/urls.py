from django.urls import path
from . import views

urlpatterns = [
    path('airports/', views.getAllAirports, name='airports'),
    path('airport/', views.getClosestAirports, name='airport'),
    path('receipt/upload/', views.uploadReceipt, name='upload_receipt'),
    path('duty/new/', views.createDuty, name='create_duty'),
    path('leg/new/', views.createLeg, name='create_leg')
]
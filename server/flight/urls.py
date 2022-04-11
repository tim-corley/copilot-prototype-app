from django.urls import path
from . import views

urlpatterns = [
    path('airports/', views.getAllAirports, name='airports'),
    path('airport/', views.getClosestAirports, name='airport'),
    path('upload/receipt/', views.uploadReceipt, name='upload_receipt'),
]
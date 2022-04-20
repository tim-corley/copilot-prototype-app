from django.urls import path
from . import views

urlpatterns = [
    path('user/<str:pk>/update/', views.update_user, name='update_user'),
]
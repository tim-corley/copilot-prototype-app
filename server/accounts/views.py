from django.conf import settings
from django.utils import timezone
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import UserSerializer
from .models import CustomUser

# Create your views here.
@api_view(['PUT'])
def update_user(request, pk):
    user = get_object_or_404(CustomUser, id=pk)

    if request.user.is_admin != True:
        return Response({'message': 'You do not have permission to update user info.'}, status=status.HTTP_403_FORBIDDEN)
    
    user.email = request.data['email']
    user.username = request.data['username']
    user.first_name = request.data['first_name']
    user.last_name = request.data['last_name']
    user.is_active = request.data['is_active']
    user.is_staff = request.data['is_staff']
    user.is_admin = request.data['is_admin']
    
    user.save()
    
    serializer = UserSerializer(user, many=False)
    
    return Response(serializer.data)
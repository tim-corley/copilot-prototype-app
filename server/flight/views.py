from django.utils import timezone
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Avg, Min, Max, Count
from django.contrib.gis.geos import fromstr
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from .filters import AirportsFilter
from .validators import validate_img_file_extention
from .serializers import AirportSerializer, AirportLocatorSerializer, PlaneSerializer, DutySerializer, LegSerializer, ReceiptSerializer
from .models import Airport, Plane, Duty, Leg, Receipt


# =======
# AIRPORT
# =======

@api_view(['GET'])
def getAllAirports(request):
    
    filterset = AirportsFilter(request.GET, queryset=Airport.objects.all().order_by('id'))
    
    count = filterset.qs.count()

    # Pagination
    resPerPage = 5
    paginator = PageNumberPagination()
    paginator.page_size = resPerPage

    queryset = paginator.paginate_queryset(filterset.qs, request)

    serializer = AirportSerializer(queryset, many=True)
    
    return Response({
        'count': count,
        'resPerPage': resPerPage,
        'airports': serializer.data
    })


@api_view(['GET'])
def getClosestAirports(request):

    longitude = float(request.query_params.get('longitude'))
    latitude = float(request.query_params.get('latitude'))

    pnt = fromstr(Point(longitude, latitude), srid=4326)

    # Get airports within 50 miles, then create a distance field, then order results by distance abd return first 5
    queryset = Airport.objects.filter(point_standard__distance_lte=(pnt, D(mi=50))).annotate(distance=Distance('point_standard', pnt)).order_by('distance')[0:5]

    serializer = AirportLocatorSerializer(queryset, many=True)

    return Response({
        'closest_airports': serializer.data
    })

# =======
# DUTY
# =======
@api_view(['POST'])
def createDuty(request):
    request.data['added_by'] = request.user
    data = request.data
    duty = Duty.objects.create(**data)
    
    serializer = DutySerializer(duty, many=False)
    
    return Response(serializer.data)

# =======
# LEG
# =======
@api_view(['POST'])
def createLeg(request):

    request.data['added_by'] = request.user
    data = request.data

    depart_location = Airport.objects.get(id=data["depart_location"])
    duty = Duty.objects.get(id=data["duty"])
    plane = Plane.objects.get(id=data["plane"])

    data = {**data, "depart_location": depart_location, "duty": duty, "plane": plane}

    leg = Leg.objects.create(**data)
    
    serializer = LegSerializer(leg, many=False)
    
    return Response(serializer.data)

# =======
# RECEIPT
# =======

@api_view(['POST'])
def uploadReceipt(request):

    receipt = request.FILES['img_file']

    if receipt == '':
        return Response({'error': 'Please upload your receipt.'})

    isValidFile = validate_img_file_extention(receipt.name)

    if not isValidFile:
        return Response({'error': 'Please ensure file is common image type (i.e. JPG, PNG).'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    duty = Duty.objects.get(id=data["duty"])
    file_handle = receipt

    data = {"file_handle": file_handle, "duty": duty, "added_by": request.user}

    receipt = Receipt.objects.create(**data)

    serializer = ReceiptSerializer(receipt, many=False)

    return Response(serializer.data)
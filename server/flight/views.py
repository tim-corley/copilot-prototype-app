from django.conf import settings
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
from .filters import AirportsFilter, PlanesFilter
from .validators import validate_img_file_extention
from .serializers import AirportSerializer, AirportLocatorSerializer, PlaneSerializer, DutySerializer, LegSerializer, ReceiptSerializer
from .models import Airport, Plane, Duty, Leg, Receipt
from .custom_storages import ReceiptStorage, PlaneStorage


# =======
# AIRPORT
# =======

@api_view(['GET'])
def get_all_airports(request):
    
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
def get_closest_airports(request):

    longitude = float(request.query_params.get('longitude'))
    latitude = float(request.query_params.get('latitude'))

    pnt = fromstr(Point(longitude, latitude), srid=4326)

    # Get airports within 50 miles, then create a distance field, then order results by distance abd return first 5
    queryset = Airport.objects.filter(point_standard__distance_lte=(pnt, D(mi=50))).annotate(distance=Distance('point_standard', pnt)).order_by('distance')[0:5]

    serializer = AirportLocatorSerializer(queryset, many=True)

    return Response({
        'closest_airports': serializer.data
    })

@api_view(['GET'])
def get_airport(request, pk):

    airport = get_object_or_404(Airport, id=pk)
    
    serializer = AirportSerializer(airport, many=False)
    
    return Response(serializer.data)

@api_view(['POST'])
def create_airport(request):

    request.data['added_by'] = request.user
    data = request.data

    airport = Airport.objects.create(**data)
    
    serializer = AirportSerializer(airport, many=False)
    
    return Response(serializer.data)

@api_view(['PUT'])
def update_airport(request, pk):
    airport = get_object_or_404(Airport, id=pk)

    if airport.added_by != request.user:
        return Response({'message': 'You do not have permission to update this airport.'}, status=status.HTTP_403_FORBIDDEN)
    
    airport.icao = request.data['icao']
    airport.state = request.data['state']
    airport.facility_name = request.data['facility_name']
    airport.lat_standard = request.data['lat_standard']
    airport.lat_radian = request.data['lat_radian']
    airport.lon_standard = request.data['lon_standard']
    airport.lon_radian = request.data['lon_radian']
    
    airport.save()
    
    serializer = AirportSerializer(airport, many=False)
    
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_airport(request, pk):
    airport = get_object_or_404(Airport, id=pk)

    if airport.added_by != request.user:
        return Response({'message': 'You do not have permission to remove this airport.'}, status=status.HTTP_403_FORBIDDEN)
    
    airport.delete()
    
    return Response({ 'message': 'Airport has successfully been deleted.' }, status=status.HTTP_200_OK)

# =======
# PLANE
# =======

@api_view(['GET'])
def get_all_planes(request):
    
    filterset = PlanesFilter(request.GET, queryset=Plane.objects.all().order_by('id'))
    
    count = filterset.qs.count()

    # Pagination
    resPerPage = 5
    paginator = PageNumberPagination()
    paginator.page_size = resPerPage

    queryset = paginator.paginate_queryset(filterset.qs, request)

    serializer = PlaneSerializer(queryset, many=True)
    
    return Response({
        'count': count,
        'resPerPage': resPerPage,
        'planes': serializer.data
    })

@api_view(['GET'])
def get_plane(request, pk):

    plane = get_object_or_404(Plane, id=pk)
    
    serializer = PlaneSerializer(plane, many=False)
    
    return Response(serializer.data)

@api_view(['POST'])
def create_plane(request):

    request.data['added_by'] = request.user
    data = request.data

    current_location = Airport.objects.get(id=data["current_location"])

    data = {**data, "current_location": current_location}

    plane = Plane.objects.create(**data)
    
    serializer = PlaneSerializer(plane, many=False)
    
    return Response(serializer.data)

@api_view(['PUT'])
def update_plane(request, pk):
    plane = get_object_or_404(Plane, id=pk)

    if plane.added_by != request.user:
        return Response({'message': 'You do not have permission to update this plane.'}, status=status.HTTP_403_FORBIDDEN)
    
    current_location = Airport.objects.get(id=request.data["current_location"])

    plane.registration = request.data['registration']
    plane.model = request.data['model']
    plane.year = request.data['year']
    plane.current_status = request.data['current_status']
    plane.current_location = current_location
    plane.img_file_handle = request.data['img_file_handle']
    plane.owner_email = request.data['owner_email']
    plane.hobbs_time = request.data['hobbs_time']
    
    plane.save()
    
    serializer = PlaneSerializer(plane, many=False)
    
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_plane(request, pk):
    plane = get_object_or_404(Plane, id=pk)

    if plane.added_by != request.user:
        return Response({'message': 'You do not have permission to remove this plane.'}, status=status.HTTP_403_FORBIDDEN)
    
    plane.delete()
    
    return Response({ 'message': 'Plane has successfully been deleted.' }, status=status.HTTP_200_OK)

# =======
# DUTY
# =======

@api_view(['GET'])
def get_duty(request, pk):

    duty = get_object_or_404(Duty, id=pk)
    
    legs = Leg.objects.filter(duty=pk)

    legs = LegSerializer(legs, many=True)

    serializer = DutySerializer(duty, many=False)
    
    return Response({'duty': serializer.data, 'legs': legs.data})

@api_view(['POST'])
def create_duty(request):

    request.data['added_by'] = request.user
    data = request.data

    duty = Duty.objects.create(**data)
    
    serializer = DutySerializer(duty, many=False)
    
    return Response(serializer.data)

@api_view(['PUT'])
def update_duty(request, pk):
    duty = get_object_or_404(Duty, id=pk)

    if duty.added_by != request.user:
        return Response({'message': 'You do not have permission to update this duty.'}, status=status.HTTP_403_FORBIDDEN)
    
    duty.oil_add = request.data['oil_add']
    duty.start_hobbs = request.data['start_hobbs']
    duty.end_hobbs = request.data['end_hobbs']
    duty.start_time = request.data['start_time']
    duty.end_time = request.data['end_time']
    
    duty.save()
    
    serializer = DutySerializer(duty, many=False)
    
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_duty(request, pk):
    duty = get_object_or_404(Duty, id=pk)

    if duty.added_by != request.user:
        return Response({'message': 'You do not have permission to remove this duty.'}, status=status.HTTP_403_FORBIDDEN)
    
    duty.delete()
    
    return Response({ 'message': 'Duty has successfully been deleted.' }, status=status.HTTP_200_OK)


# =======
# LEG
# =======

@api_view(['POST'])
def create_leg(request):

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
def upload_receipt(request):

    receipt = request.FILES['img_file']

    if receipt == '':
        return Response({'error': 'Please upload your receipt.'})

    isValidFile = validate_img_file_extention(receipt.name)

    if not isValidFile:
        return Response({'error': 'Please ensure file is common image type (i.e. JPG, PNG).'}, status=status.HTTP_400_BAD_REQUEST)

    full_s3_bucket_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{ReceiptStorage.location}/" 

    data = request.data
    duty = Duty.objects.get(id=data["duty"])
    img_file_handle = receipt

    data = {"img_file_handle": full_s3_bucket_url + str(img_file_handle), "duty": duty, "added_by": request.user}

    receipt = Receipt.objects.create(**data)

    serializer = ReceiptSerializer(receipt, many=False)

    return Response(serializer.data)
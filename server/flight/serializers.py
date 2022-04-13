from rest_framework import serializers
from .models import Airport, Plane, Duty, Leg, Receipt
from accounts.serializers import UserCreateSerializer

class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'

class AirportLocatorSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()
    # Measurement unit being returned controlled here
    # Docs: https://docs.djangoproject.com/en/4.0/ref/contrib/gis/measure/#supported-units
    # https://docs.djangoproject.com/en/4.0/ref/contrib/gis/functions/#django.contrib.gis.db.models.functions.Distance
    def get_distance(self, obj):
        return round(obj.distance.mi, 2)
    
    class Meta:
        model = Airport
        fields = ('id', 'icao', 'facility_name', 'state', 'distance')


class PlaneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plane
        fields = '__all__'


class LegSerializer(serializers.ModelSerializer):
    depart_location = AirportSerializer(many=False, read_only=True)
    plane = PlaneSerializer(many=False, read_only=True)
    added_by = UserCreateSerializer(many=False, read_only=True)
    class Meta:
        model = Leg
        fields = '__all__'


class DutySerializer(serializers.ModelSerializer):
    legs = LegSerializer(many=True, read_only=True)
    class Meta:
        model = Duty
        fields = '__all__'


class ReceiptSerializer(serializers.ModelSerializer):
    # added_by = UserCreateSerializer(many=False, read_only=True)
    # duty = DutySerializer(many=False, read_only=True)
    class Meta:
        model = Receipt
        fields = '__all__'



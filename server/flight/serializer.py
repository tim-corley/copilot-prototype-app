from rest_framework import serializers
from .models import Airport, Plane, Duty, Leg, Receipt

class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'


class PlaneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plane
        fields = '__all__'


class DutySerializer(serializers.ModelSerializer):
    class Meta:
        model = Duty
        fields = '__all__'


class LegSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leg
        fields = '__all__'

class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = '__all__'
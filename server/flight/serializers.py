from rest_framework import serializers
from .models import Airport, Plane, Duty, Leg, Receipt

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
        fields = ('icao', 'facility_name', 'state', 'distance')


class PlaneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plane
        fields = '__all__'


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = '__all__'


class LegSerializer(serializers.ModelSerializer):
    planes = PlaneSerializer(many=False)
    receipts = ReceiptSerializer(many=True)
    class Meta:
        model = Leg
        # fields = ['depart_time', 'depart_location', 'duty', 'user', 'created_at']
        fields = ['depart_location']

    def create(self, validated_data):
        """
        Overriding the default create method of the Model serializer.
        :param validated_data: data containing all the details of student
        :return: returns a successfully created student record
        """
        depart_location_data = validated_data.pop('depart_location')
        depart_location = AirportSerializer.create(AirportSerializer(), validated_data=depart_location_data)
        print(f"\nTEST LOCATION: {depart_location}")
        depart, created = Leg.objects.update_or_create(depart_location=depart_location)
        return depart


class DutySerializer(serializers.ModelSerializer):
    legs = LegSerializer(many=True)
    class Meta:
        model = Duty
        fields = ['id', 'created_at', 'oil_add', 'start_hobbs', 'legs']





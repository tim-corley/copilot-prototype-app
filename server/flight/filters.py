from django_filters import rest_framework as filters
from .models import Airport

class AirportsFilter(filters.FilterSet):

    code = filters.CharFilter(field_name='icao', lookup_expr='icontains')
    state = filters.CharFilter(field_name='state', lookup_expr='icontains')
    name = filters.CharFilter(field_name='facility_name', lookup_expr='icontains')

    class Meta:
        """
        These fields allow for query params to be applied to the endpoint when making get request for airport in order to filter results
        Ex.: http:<DOMAIN>/api/airport/?state=MA
        """
        model = Airport
        fields = ('code', 'state', 'name')
from django_filters import rest_framework as filters
from .models import Airport, Plane

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



class PlanesFilter(filters.FilterSet):

    registration = filters.CharFilter(field_name='registration', lookup_expr='icontains')
    model = filters.CharFilter(field_name='model', lookup_expr='icontains')
    year = filters.NumberFilter(field_name='year', lookup_expr='year')
    current_status = filters.CharFilter(field_name='registration', lookup_expr='iexact')

    class Meta:
        """
        These fields allow for query params to be applied to the endpoint when making get request for airport in order to filter results
        Ex.: http:<DOMAIN>/api/plane/?year=2012
        """
        model = Plane
        fields = ('registration', 'model', 'year', 'current_status')
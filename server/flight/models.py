from datetime import datetime
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.contrib.gis.db import models as gismodels
from django.contrib.gis.geos import Point

current_year = datetime.now().year

class PlaneStatus(models.TextChoices):
    Active = 'Active'
    Reserved = 'Reserved'
    Available = 'Available'
    Maintenance = 'Maintenance'


class DutyType(models.TextChoices):
    Charter = 'Charter'
    Maintenance = 'Maintenance'
    Training = 'Training'
    Nonflying = 'Nonflying'
    Instruction = 'Instruction'
    Personal = 'Personal'


class Airport(models.Model):
    icao = models.CharField(max_length=4)
    state = models.CharField(max_length=2)
    facility_name = models.CharField(max_length=200)
    lat_standard = models.FloatField()
    lat_radian = models.FloatField()
    lon_standard = models.FloatField()
    lon_radian = models.FloatField()
    point_standard = gismodels.PointField(default=Point(0.0, 0.0))
    point_radian = gismodels.PointField(default=Point(0.0, 0.0))

    def save(self, *args, **kwargs):

        s_lng = self.lon_standard
        s_lat = self.lat_standard
        r_lng = self.lon_radian
        r_lat = self.lat_radian

        self.point_standard = Point(s_lng, s_lat)
        self.point_radian = Point(r_lng, r_lat)
        super(Airport, self).save(*args, **kwargs)


class Plane(models.Model):
    registration = models.CharField(max_length=200)
    model = models.CharField(max_length=200)
    year = models.IntegerField(default=current_year, validators=[MinValueValidator(1903), MaxValueValidator(current_year)])
    current_status = models.CharField(
        max_length=12,
        choices=PlaneStatus.choices,
        default=PlaneStatus.Available
    )
    current_location = models.ForeignKey(Airport, on_delete=models.SET_NULL, null=True)
    file_handle = models.FileField(null=True, default='')
    owner_email = models.EmailField(null=True)
    hobbs_time = models.FloatField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    duty = models.ForeignKey('Duty', on_delete=models.SET_NULL, null=True)


class Duty(models.Model):
    oil_add = models.FloatField(null=True)
    start_hobbs = models.FloatField(null=True)
    end_hobbs = models.FloatField(null=True)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)
    leg = models.ForeignKey('Leg', related_name='dutyleg', on_delete=models.SET_NULL, null=True)
    receipt = models.ForeignKey('Receipt', related_name='dutyreceipt', on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Leg(models.Model):
    depart_time = models.DateTimeField(null=True)
    depart_location = models.ForeignKey(Airport, related_name='legdepartlocation', on_delete=models.SET_NULL, null=True)
    arrival_time = models.DateTimeField(null=True)
    arrival_location = models.ForeignKey(Airport, related_name='legarrivallocation', on_delete=models.SET_NULL, null=True)
    duty = models.ForeignKey(Duty, related_name='legduty', on_delete=models.SET_NULL, null=True)
    plane = models.ForeignKey(Plane, on_delete=models.SET_NULL, null=True)
    receipt = models.ForeignKey('Receipt', related_name='legreceipt', on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Receipt(models.Model):
    file_handle = models.FileField(null=False, default='')
    duty = models.ForeignKey(Duty, related_name='receiptduty', on_delete=models.SET_NULL, null=True)
    leg = models.ForeignKey(Leg, related_name='receiptleg', on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
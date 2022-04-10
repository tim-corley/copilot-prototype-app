import os
import csv
import itertools
import django

# import os, sys
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# print(f"\n\nBASE: {BASE_DIR}")
# sys.path.append(BASE_DIR)
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# TODO move script to tools/ directory & figure out import / server.setting issue
# TODO move csv file to flight/ dir and adjust open() arg

django.setup()

from django.contrib.auth.models import User
from flight.models import Airport, Plane, Duty, Leg, Receipt

with open('airportdatafixed-raw.csv') as airportfile:
    airport_data = csv.reader(airportfile, delimiter=',')
    for row in itertools.islice(airport_data, 0, 9):
        Airport(icao=f"{row[0]}", state=f"{row[1]}", facility_name=f"{row[2]}", lat_standard=float(row[3]), lat_radian=float(row[4]), lon_standard=float(row[5]), lon_radian=float(row[6])).save()
    print("Airport data has been successfully seeded.")
    airportfile.close()

with open('airplanedata-raw.csv') as airplanefile:
    plane_data = csv.reader(airplanefile, delimiter=',')
    sample_port = Airport.objects.first()
    sample_user = User.objects.first()
    for row in plane_data:
        Plane(registration=f"{row[0]}", model=f"{row[1]}", year=f"{row[2]}", current_status=f"{row[3]}", current_location=sample_port, owner_email=f"{row[4]}", hobbs_time=f"{row[5]}", user=sample_user).save()
    print("Airplane data has been successfully seeded.")
    airplanefile.close()
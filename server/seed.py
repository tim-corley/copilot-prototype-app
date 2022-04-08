import os
import csv
import itertools
import django

# import os, sys
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# print(f"\n\nBASE: {BASE_DIR}")
# sys.path.append(BASE_DIR)
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

django.setup()

from flight.models import Airport, Plane, Duty, Leg, Receipt

with open('airportdata-raw.csv') as airportfile:
    data = csv.reader(airportfile, delimiter=',')
    for row in itertools.islice(data, 0, 9):
        print(f"CODE: {row[0]}\nSTATE: {row[1]}\nNAME: {row[2]}")
        Airport(icao=f"{row[0]}", state=f"{row[1]}", facility_name=f"{row[2]}", lat_standard=float(row[3]), lat_radian=float(row[4]), lon_standard=float(row[5]), lon_radian=float(row[6])).save()
        print("\n\nAirport data has been successfully seeded.")
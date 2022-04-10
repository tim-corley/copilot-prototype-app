from django.contrib import admin
from .models import Airport, Plane, Duty, Leg, Receipt

admin.site.register(Airport)
admin.site.register(Plane)
admin.site.register(Duty)
admin.site.register(Leg)
admin.site.register(Receipt)

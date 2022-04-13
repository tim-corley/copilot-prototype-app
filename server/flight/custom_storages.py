from storages.backends.s3boto3 import S3Boto3Storage

# List of available setting that could be passed here:
# https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html
class ReceiptStorage(S3Boto3Storage):
    location = 'receipts'

class PlaneStorage(S3Boto3Storage):
    location = 'planes'
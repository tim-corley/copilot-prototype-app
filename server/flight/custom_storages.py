from storages.backends.s3boto3 import S3Boto3Storage

class ReceiptStorage(S3Boto3Storage):
    location = 'receipts'

class PlaneStorage(S3Boto3Storage):
    location = 'planes'
import os

def validate_img_file_extention(name):
    isValid = True

    ext = os.path.splitext(name)[1]
    valid_extensions = ['.ras', '.xwd', '.bmp', '.jpe', '.jpg', '.jpeg', '.xpm', '.ief', '.pbm', '.tif', '.gif', '.ppm', '.xbm', '.tiff', '.rgb', '.pgm', '.png', '.pnm', 'heic', 'heif']

    if not ext.lower() in valid_extensions:
        isValid = False

    return isValid
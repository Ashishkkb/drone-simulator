import csv
import random

# Generate 1000 random coordinates
coordinates = [(random.uniform(-180, 180), random.uniform(-90, 90)) for _ in range(1000)]

# Save the coordinates to a CSV file
with open('drone_coordinates.csv', 'w', newline='') as csvfile:
    fieldnames = ['Longitude', 'Latitude']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for lon, lat in coordinates:
        writer.writerow({'Longitude': lon, 'Latitude': lat})
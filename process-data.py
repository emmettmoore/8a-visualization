from pymongo import MongoClient
from pygeocoder import Geocoder

port = 27017
client = MongoClient('localhost', port)
db = client['8a']
crags = db.crags
print "Connected to database on {}".format(port)
print

print "Geocoding crag locations..."
print "****************************"
for crag in crags.find({}, {"location": 1, "name": 1}):
    location = crag['location']
    geocoded = Geocoder.geocode(location)
    print "   {} ({}) --> {} {}".format(crag['name'], crag['location'], geocoded, geocoded[0].coordinates)

    crags.update({"_id": crag["_id"]}, {
        "$set": {
            "coordinates": list(geocoded[0].coordinates)
        }
    })


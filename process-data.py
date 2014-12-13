from __future__ import print_function
import sys
import ijson
from pygeocoder import Geocoder

def softness(ascents, grade):
    soft = 0
    fair = 0
    hard = 0
    for ascent in ascents:
        if not type(ascent) is dict:
            print( "ERROR: ascent is a {}: {}".format(type(ascent), ascent), file=sys.stderr )
            continue

        asc_grade = ascent['grade']
        asc_comment = ascent['comment']

        if not asc_grade[0].isdigit():
            print( "Not a real grade: {}".format(asc_grade), file=sys.stderr )
            continue

        if asc_grade == grade:
            if asc_comment.startswith("Soft"):
                soft += 1
            elif asc_comment.startswith("Hard"):
                hard += 1
            else:
                fair += 1
        elif asc_grade < grade:
            if not asc_comment.startswith("Hard"):  # grades are lexicographically comparable, nice
                soft += 1
            else:
                print( ascent["climber"] + " is an idiot on " + ascent['route_name'], file=sys.stderr )
                fair += 1
        elif asc_grade > grade:
            hard += 1
        else:
            print( "INCONCEIVABLE!", file=sys.stderr )
            fair += 1

    return {
        "soft": soft,
        "fair": fair,
        "hard": hard,
        "total": soft+fair+hard
    }



dataPath = 'data/rrg.json'

output = []

with open(dataPath) as f:
    crags = ijson.items(f, 'crags.item')
    for crag in crags:

        # geocode the crag
        location = crag['location']
        geocoded = Geocoder.geocode(location)
        print( "{} ({}) --> {}".format(crag['name'], crag['location'], geocoded) )
        crag["coordinates"] = geocoded[0].coordinates

        for route in crag['route']:
            # get softness of route
            route.update( softness(route['ascents'], route['grade']) )

            # remove unneded fields to reduce size of output
            for field in ['ascents', 'index', 'thumbs_up', 'f_os', 'crag']:
                del route[field]

            if (route['total'] == 0):
                print( "No ascents for {}".format(route['name']) )
                # TODO: delete route in that case
            else:
                print( "   {name} ({grade}): {soft} soft, {fair} fair, {hard} hard / {total}".format(**route) )

        output.append(crag)

from __future__ import print_function
import sys
import cPickle
import os.path

import ijson
from pygeocoder import Geocoder

def print_err(msg):
    print(msg, file=sys.stderr)

def softness(ascents, grade):
    soft = 0
    fair = 0
    hard = 0
    for ascent in ascents:
        if not type(ascent) is dict:
            print_err( "ERROR: ascent is a {}: {}".format(type(ascent), ascent) )
            continue

        asc_grade = ascent['grade']
        asc_comment = ascent['comment']

        if not asc_grade[0].isdigit():
            print_err( "Not a real grade: {}".format(asc_grade) )
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
                print_err( ascent["climber"] + " is an idiot on " + ascent['route_name'] )
                fair += 1
        elif asc_grade > grade:
            hard += 1
        else:
            print_err( "INCONCEIVABLE!" )
            fair += 1

    return {
        "soft": soft,
        "fair": fair,
        "hard": hard,
        "total": soft+fair+hard
    }


def cragsFromJson(dataPath):
    cragsList = []
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

            cragsList.append(crag)
    return cragsList

def cragsFromPickle(dataPath):
    with open(dataPath) as f:
        unpickler = cPickle.Unpickler(f)
        cragsList = unpickler.load()
    return cragsList
        


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print( "Useage: {} <data_file.json | cragList.pickle>" )
        sys.exit(1)

    dataPath = sys.argv[1]
    if dataPath.endswith(".pickle"):
        ## load from pickle
        crags = cragsFromPickle(dataPath)

        for crag in crags:
            print( "{name}".format(**crag) )
            for route in crag['route']:
                print( "   {name} ({grade}): {soft} soft, {fair} fair, {hard} hard / {total}".format(**route) ) 

    elif dataPath.endswith(".json"):
        ## load from json
        crags = cragsFromJson(dataPath)

        # pickle it, now that we've got it
        pickleName = 'pickles/{}.pickle'.format(os.path.basename(dataPath).split('.')[0])
        with open(pickleName, 'w') as f:
            print_err("Pickling to {}...".format(pickleName))
            pickler = cPickle.Pickler(f)
            pickler.dump(crags)
    else:
        print_err( "Unknown filetype for " + dataPath)
        sys.exit(1)




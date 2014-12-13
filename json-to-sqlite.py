import ijson

parser = ijson.parse(f)

parentNames = []
parentIds = []
objs = []

# objs (a stack):
# [
#  {
# 	 "key1_name": {
# 		 "type": "string" || "number" || ...,
# 		 "value": *
# 	 },
# 	 "key2_name": {...}
#  },
#  {
#	  ...
#   }
# ]


for prefix, event, value in parser:

	if event == 'start_map': # and start_array?
		# get auto_increment value for parent's table (parentNames[-1])
		# push auto_increment onto parentIds

	elif event == 'start_array':

	elif event == 'map_key':
		# push value onto parentNames

	elif event in ('string', 'number'):
		# pop off parentNames for keyname
		# construct {type, value}
		# add to objs

	elif event == 'end_map':
		# see if the parent's name exists as a table
		# if not, create that table with schema of this object (last obj in objs)
		# and {{parentName}}_id = parentIds[-1???]

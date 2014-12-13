if [ $# -lt 3 ]; then
  echo "Useage: $0 <filename.json> <db-name> <collection-name>"  
  exit 1
fi
ORIG_JSON=$1
DB=$2
COLLECTION=$3

# Turn a JSON object containing an array into just the array
# mongoimport needs this, otherwise you'd just get one giant document

## figure out index of first open bracket in file, where array starts
ARR_START=$(head -c 100 $ORIG_JSON | sed 's/\(.\)/\1\
  /g' | grep -n -m 1 "\[" | cut -d: -f1)

# Remove everything before that
cut -c "$ARR_START-" $ORIG_JSON > new_json.json
# Remove the last character (expected to be a }, for the containing object)
sed -i '' '$s/.$//' new_json.json

mongoimport --db $DB --collection $COLLECTION --type json --file new_json.json --jsonArray

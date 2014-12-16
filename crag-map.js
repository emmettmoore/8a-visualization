var NUM_RED_ASCENTS = 24692;

highlighted = new ReactiveVar();

var softColor = 'blue';
var hardColor = 'red';

var color = d3.scale.linear()
    .domain([-0.15, 0, 0.15])
    .range([softColor, 'rgb(245, 245, 245)', hardColor])

var fills = {}
var fillKeys = {}
var url = "/prod-data/8a-gl-filtered.json";

d3.json(url, function(err, response) {
    var raw_crags = response;
    console.log(raw_crags);
    populate_fills(raw_crags);
    load_crags(raw_crags);
    graph_all_crags(raw_crags);
});

function graph_all_crags(data) {
    grapher = sandBagGraph()
      .fairnessAccessor(function(d, i) {
        return d.fairness;
      })
      .hover(setRef(highlighted), setRef(highlighted, null))
      ;

    graph = d3.select("#all-crags-graph")
      .datum(data)
      .call(grapher)
      ;

    Tracker.autorun(function highlightGraph() {
      var ref = highlighted.get();
      if (!ref) {
        graph.call(grapher.highlighter(null))
      } else {
        graph.call(grapher.highlighter(ref.d, ref.i));
      }
    });
}

function populate_fills(raw_crags) {
    for (var i=0; i< raw_crags.length; i++) {
        fair_color = color(raw_crags[i]['fairness'])
        fills[raw_crags[i]['name']] = fair_color;
        fillKeys[raw_crags[i]['name']] = {fillKey: raw_crags[i]['name']};
    }
    fills['defaultFill'] = 'white';
}

function get_radius(num_ascents) {
    return Math.max(30 * (num_ascents / NUM_RED_ASCENTS), 4.1) ;
}

function load_crags(raw_crags) {
    var crag_map = new Datamap({
        element: document.getElementById('crag-map'),
        // height: 600,
        // width: 400,
        scope:   'usa',
        fills: fills,
        fillKeys: fillKeys,
        geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false,
            borderColor: '#FFB680'
        }, 
        bubble_config: {
            borderWidth: 2,
            borderColor: '#000000',
            popupOnHover: true,
            popupTemplate: function(geography, data) {
                return '<div class="hoverinfo"><strong>' + data.name + '</strong></br>' + data.fillKey + '</div>';
            },
        }
    });
    crags = [];
    for (var i=0; i< raw_crags.length; i++) {
        var crag = raw_crags[i];
        crags.push({
              name: crag['name'],
              radius: get_radius(crag['total_ascents']),
              fillKey: crag['name'],
              latitude: crag["coordinates"][0],
              longitude: crag["coordinates"][1],
              });
    }
/*
    var crags = [{
              name: 'Red River Gorge',
              radius: 20,
              fillKey: 'RRG',
              latitude: 37.80,
              longitude: -83.70,
    },{
              name: 'NRG',
              radius: 14,
              fillKey: 'NRG',
              latitude: 38.05,
              longitude: -81.11

    },{
              name: 'RUM',
              radius: 17,
              fillKey: 'RUM',
              latitude: 43.80,
              longitude: -71.81
    
    }]; 
    */
    //draw bubbles for crags
     crag_map.bubbles(crags, {
        popupTemplate: function (geo, data) { 
            return ['<div class="hoverinfo">' +  data.name,
            '</div>'].join('');
        }
    });
}

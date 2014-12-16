var NUM_RED_ASCENTS = 24692;

highlightedCrag = new ReactiveVar();
// clickedCrag = new ReactiveVar();
highlightedRoute = new ReactiveVar();

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
    populate_fills(raw_crags);
    load_crags(raw_crags);
    graph_all_crags(raw_crags);
});

function graph_all_crags(data) {
    cragsGrapher = sandBagGraph()
      .fairnessAccessor(function(d, i) {
        return d.fairness;
      })
      .fairnessArrAccessor(function(d) {
        return d.route;
      })
      .hover(setRef(highlightedCrag), setRef(highlightedCrag, null))
      .routeHover(setRef(highlightedRoute), setRef(highlightedRoute, null))
      // .click(function(d, i) {
      //   clickedCrag.set({d: d, i: i});
      //   d3.select(this.parentNode).select(".clicked")
      //     .classed("clicked", false);
      //   d3.select(this)
      //     .classed("clicked", true);
      // })
      ;
    routesGrapher = sandBagGraph()
      .fairnessArrAccessor(function(d) {
        return d.fairness_arr;
      })
      ;

    cragsGraph = d3.select("#all-crags-graph")
      .datum(data)
      .call(cragsGrapher)
      ;
    routesGraph = d3.select("#routes-graph")
      .datum([])
      .call(routesGrapher)
      ;

    Tracker.autorun(function highlightCragsGraph() {
      var ref = highlightedCrag.get();
      if (!ref) {
        cragsGraph.call(cragsGrapher.highlighter(null))
      } else {
        cragsGraph.call(cragsGrapher.highlighter(ref.d, ref.i));
      }
    });

    Tracker.autorun(function highlightRoutesGraph() {
      var ref = highlightedRoute.get();
      if (!ref) {
        routesGraph.call(routesGrapher.highlighter(null))
      } else {
        routesGraph.call(routesGrapher.highlighter(ref.d, ref.i));
      }
    });

    Tracker.autorun(function updateRoutesData() {
      var highlightRef = highlightedCrag.get();
      // var clickRef = clickedCrag.get();
      var highlightCrag = (highlightRef || {}).d;
      // var clickCrag = (clickRef || {}).d;

      var crag = highlightCrag;
      // var crag = highlightCrag && typeof highlightCrag != "string"
          // ? highlightCrag : clickCrag

      var data = [];
      if (Array.isArray(crag)) {
        alert('ITS AN ARRAY!');
        debugger;
      }
      if (crag && typeof crag != "string") {
        crag.route.forEach(function(route) {
          if (!route.fairness_arr) {
            var fairness_arr = [];
            for (var i = 0; i < route.soft; i++)
                fairness_arr.push(-1);
            for (var i = 0; i < route.fair; i++)
                fairness_arr.push(0);
            for (var i = 0; i < route.hard; i++)
                fairness_arr.push(1);
            route.fairness_arr = fairness_arr;
          }
        });
        data = crag.route;
      }

      routesGraph
        .datum(data)
        .call(routesGrapher)
        ;
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
        bubblesConfig: {
            borderWidth: 2,
            borderColor: '#000000',
            popupOnHover: true,
            popupTemplate: function(geography, data) {
                highlightedCrag.set({d: data})
                return '<div class="hoverinfo"><strong>' + data.name + '</strong></br>' + data.fillKey + '</div>';
            },
        }
    });
    crags = [];
    for (var i=0; i< raw_crags.length; i++) {
        var crag = raw_crags[i];
        crags.push({
              name: crag['name'],
              fairness: crag['fairness'],
              softest_route: crag['route'][0]['name'],
              softest_route_grade: crag['route'][0]['grade'],
              hardest_route: crag['route'][crag['route'].length - 1]['name'],
              hardest_route_grade: crag['route'][crag['route'].length - 1]['grade'],
              radius: get_radius(crag['total_ascents']),
              fillKey: crag['name'],
              latitude: crag["coordinates"][0],
              longitude: crag["coordinates"][1],
              });
    }
    //draw bubbles for crags
     crag_map.bubbles(crags, {
        popupTemplate: function (geo, data) { 
            return ['<div class="hoverinfo">' +  data.name,
            '</div>'].join('');
        }
    });
}

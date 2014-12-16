var NUM_RED_ASCENTS = 24692;

highlightedCrag = new ReactiveVar();
clickedCrag = new ReactiveVar();  // CLICK
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
      .hover(setRef(highlightedCrag)/*, setRef(highlightedCrag, null)*/)
      .routeHover(setRef(highlightedRoute), setRef(highlightedRoute, null))
      /// CLICK
      .click(function(d, i) {
        clickedCrag.set({d: d, i: i});
        d3.select(this.parentNode).select(".clicked")
          .classed("clicked", false);
        d3.select(this)
          .classed("clicked", true);
      })
      /// /CLICK
      ;
    routesGrapher = sandBagGraph()
      .fairnessArrAccessor(function(d) {
        return d.fairness_arr;
      })
      .label(false)
      ;

    cragsGraph = d3.select("#all-crags-graph")
      .datum(data)
      .call(cragsGrapher)
      ;
    routesGraph = d3.select("#routes-graph")
      .datum([])
      .call(routesGrapher)
      ;

    routeName = d3.select("#route-name");
    routeGrade = d3.select("#route-grade");

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
        routesGraph.call(routesGrapher.highlighter(null));
        routeName.text("");
        routeGrade.text("");
      } else {
        routesGraph.call(routesGrapher.highlighter(ref.d, ref.i));
        routeName.text(ref.d.name);
        routeGrade.text(ref.d.grade);
      }
    });

    Tracker.autorun(function updateRoutesData() {
      var highlightRef = highlightedCrag.get();
      var clickRef = clickedCrag.get();  // CLICK
      var highlightCrag = (highlightRef || {}).d;
      var clickCrag = (clickRef || {}).d;  // CLICK

      var crag = highlightCrag;
      // CLICK
      var crag = highlightCrag && typeof highlightCrag != "string"
          ? highlightCrag : clickCrag
      // /CLICK

      var data = [];
      if (Array.isArray(crag)) {
        // alert('ITS AN ARRAY!');  // CLICK
        // debugger;  // CLICK
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


    // Demo graph
    demoHighlightedRoute = new ReactiveVar();
    demoGrapher = sandBagGraph()
      .fairnessAccessor(function(d, i) {
        return d.fairness;
      })
      .fairnessArrAccessor(function(d) {
        return d.route;
      })
      .routeHover(setRef(demoHighlightedRoute), setRef(demoHighlightedRoute, null))
      .label(false)
      ;

    demoGraph = d3.select("#demo-graph")
      .datum([data[3]])
      .call(demoGrapher)
      ;

    var demoRoute = d3.select("#demo-route"),
        demoStats = d3.select("#demo-stats")
        demoFairness = d3.select("#demo-fairness"),

    Tracker.autorun(function updateDemo() {
      var ref = demoHighlightedRoute.get();
      if (ref) {
        var route = ref.d;
        demoRoute.text(route.name + " ("+route.grade+")");
        demoStats.text(route.soft+" soft, "+route.fair+" fair or unnoted, "+route.hard+" hard");
        demoFairness.text("Fairness: "+route.fairness);
      }
    })
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

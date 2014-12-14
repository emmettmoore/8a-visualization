var crag_map = new Datamap({
    element: document.getElementById('crag-map'),
    scope:   'usa',
    fills: { 
        'RRG': '#7a8cff',
        'NRG': '#ffe7d8',
        'RUM': '#ff3240',//#ffa89d
        defaultFill: 'rgba(229,255,218,0.9)' //248 255 231
    }, 
    data: {
        'RRG': {fillKey: 'RRG'},
        'NRG': {fillKey: 'NRG'},
        'RUM': {fillKey: 'RUM'},
   },
    geographyConfig: {
        popupOnHover: false,
        highlightOnHover: false,
        borderColor: '#FFB680'
    },
    bubblesConfig: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        popupOnHover: true,
        popupTemplate: function(geography, data) {
            return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
        },
        fillOpacity: 0.75,
        highlightFillColor: '#FC8D59',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2,
        highlightFillOpacity: 0.85
}
});


var crags = [{
          name: 'RRG',
          radius: 20,
          fillKey: 'RRG',
          latitude: 37.80,
          longitude: -83.70,
          hoverColor: '#7a8cff',
          highlightOnHover: false
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
}
];
//draw bubbles for crags
crag_map.bubbles(crags, {
    popupTemplate: function (geo, data) { 
        return ['<div class="hoverinfo">' +  data.name,
        '</div>'].join('');
    }
});

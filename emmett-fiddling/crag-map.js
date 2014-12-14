var crag_map = new Datamap({
    element: document.getElementById('crag-map'),
    scope:   'usa',
    geographyConfig: {
        popupOnHover: false,
        highlightOnHover: false,
        borderColor: '#FFB680'
    },
    fills: { 
        'RRG': '#7a8cff',
        'NRG': '#ffe7d8',
        'RUM': '#ffa89d',
        defaultFill: 'rgba(255,130,87,0.9)' 
    }, 
    data: {
        'RRG': {fillKey: 'RRG'},
        'NRG': {fillKey: 'NRG'},
        'RUM': {fillKey: 'RUM'},
   }
});


var crags = [{
          name: 'RRG',
          radius: 10,
          fillKey: 'RRG',
          latitude: 37.80,
          longitude: -83.70
},{
          name: 'NRG',
          radius: 6,
          fillKey: 'NRG',
          latitude: 38.05,
          longitude: -81.11

},{
          name: 'RUM',
          radius: 4,
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

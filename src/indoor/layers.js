// filtre par level (multi level)
function levelFilter(indoorType, isMultiLevel) {
  return [
    'all',
    ['==', ['get', 'indoor'], indoorType],
    ['==', ['get', 'is_multi_level'], isMultiLevel]
  ];
}

// no access
function fillColor(normalColor) {
  return [
    'match',
    ['get', 'access'],
    'no', '#b8bec5',
    'private', '#b8bec5',
    normalColor
  ];
}

const lineColor = [
  'match',
  ['get', 'access'],
  'no', '#737b84',
  'private', '#737b84',
  '#4b5560'
];

// indoor=area n'est pas censé avoir de murs par défaut, mais il faut fix 
const isBorderlessArea = [
  'all',
  ['==', ['get', 'indoor'], 'area'],
  //['!', ['has', 'building']]
];

export function createIndoorLayers() {
  return [
    /* Ordre de couches (derniere ligne = plus haute couche):
      indoor=area multi < single
      indoor room < corridor < lines multi
      indoor room < corridor < lines single  ==>  on peut avoir deux features au même endroit, même étage (ex: B4 A304)
      indoor lines repeat_on  ==>  gère repeat_on à part
      indoor=doors way > node
      indoor=doors open  way > node
      indoor= stairs/elevators
      indoor LABELS*/
    {
      id: 'indoor-area-multi',
      type: 'fill',
      filter: levelFilter('area', true),
      paint: { 'fill-color': fillColor('#e6e0f5'), 'fill-opacity': 1 },
      source: 'indoor'
    },
    {
      id: 'indoor-area-single',
      type: 'fill',
      filter: levelFilter('area', false),
      paint: { 'fill-color': fillColor('#e6e0f5'), 'fill-opacity': 1 },
      source: 'indoor'
    },
    {
      id: 'indoor-room-multi',
      type: 'fill',
      filter: levelFilter('room', true),
      paint: { 'fill-color': fillColor('#f4d9d2'), 'fill-opacity': 1 },
      source: 'indoor'
    },
    {
      id: 'indoor-corridor-multi',
      type: 'fill',
      filter: levelFilter('corridor', true),
      paint: { 'fill-color': fillColor('#d9eee8'), 'fill-opacity': 1 },
      source: 'indoor'
    },
    {
      id: 'indoor-lines-multi',
      type: 'line',
      filter: ['all', ['has', 'indoor'], ['!', isBorderlessArea], ['==', ['get', 'is_multi_level'], true]],
      paint: { 'line-color': lineColor, 'line-width': 1.5 },
      source: 'indoor'
    },
    {
      id: 'indoor-room-single',
      type: 'fill',
      filter: levelFilter('room', false),
      paint: { 'fill-color': fillColor('#f4d9d2'), 'fill-opacity': 1 },
      source: 'indoor'
    },
    {
      id: 'indoor-corridor-single',
      type: 'fill',
      filter: levelFilter('corridor', false),
      paint: { 'fill-color': fillColor('#d9eee8'), 'fill-opacity': 1 },
      source: 'indoor'
    },
    {
      id: 'indoor-lines-single',
      type: 'line',
      filter: ['all', ['has', 'indoor'], ['!', isBorderlessArea], ['==', ['get', 'is_multi_level'], false]],
      paint: { 'line-color': lineColor, 'line-width': 1.5 },
      source: 'indoor'
    },
    {
      id: 'indoor-lines-repeat-on',
      type: 'line',
      filter: ['all', ['has', 'indoor'], ['!', isBorderlessArea], ['==', ['get', 'is_multi_level'], true], ['has', 'repeat_on']],
      paint: { 'line-color': lineColor, 'line-width': 1.5 },
      source: 'indoor'
    },
    {
      id: 'indoor-doors-way',
      type: 'line',
      filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'indoor'], 'door'], ['==', ['get', 'door'], 'yes']],
      paint: { 'line-color': '#9a5b2f', 'line-width': 2.5 },
      source: 'indoor'
    },
    {
      id: 'indoor-doors-node',
      type: 'circle',
      filter: ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'indoor'], 'door'], ['==', ['get', 'door'], 'yes']],
      paint: { 'circle-color': '#fff1d6', 'circle-radius': 4, 'circle-stroke-color': '#9a5b2f', 'circle-stroke-width': 1.5 },
      source: 'indoor'
    },
    {
      id: 'indoor-open-doors-way',
      type: 'line',
      filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'indoor'], 'door'], ['==', ['get', 'door'], 'no']],
      paint: { 'line-color': '#5270b1', 'line-width': 2.5 },
      source: 'indoor'
    },
    {
      id: 'indoor-open-doors-node',
      type: 'circle',
      filter: ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'indoor'], 'door'], ['==', ['get', 'door'], 'no']],
      paint: { 'circle-color': '#a9bce6', 'circle-radius': 4, 'circle-stroke-color': '#5270b1', 'circle-stroke-width': 1.5 },
      source: 'indoor'
    },
    /*{
      id: 'indoor-stairs',
      type: 'symbol',
      filter: [
        'all',
        ['any', ['==', ['get', 'indoor'], 'area'], ['==', ['get', 'indoor'], 'room']],
        ['==', ['get', 'stairs'], 'yes']
      ],
      layout: {
        'icon-image': 'stairs',
        'icon-size': 1,
        'icon-allow-overlap': true
      },
      source: 'indoor'
    },
    {
      id: 'indoor-elevator',
      type: 'symbol',
      filter: ['==', ['get', 'highway'], 'elevator'],
      layout: {
        'icon-image': 'elevator',
        'icon-size': 1,
        'icon-allow-overlap': true
      },
      source: 'indoor'
    },*/
    {
      id: 'indoor-labels',
      type: 'symbol',
      filter: ['any', ['has', 'name'], ['has', 'ref']],
      layout: {
        'text-field': ['coalesce', ['get', 'name'], ['get', 'ref'], ''],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-anchor': 'center',
        'text-allow-overlap': false
      },
      paint: {
        'text-color': ['match', ['get', 'access'], 'no', '#626a73', 'private', '#626a73', '#26313b'],
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      },
      source: 'indoor'
    }
  ];
}
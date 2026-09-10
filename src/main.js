import { NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { addIndoorTo, IndoorMap } from 'map-gl-indoor';
import { createMap } from './map/createMap.js';
import { geolocateControl } from './map/geolocalisation.js';
import { fixLevels } from './indoor/fixLevels.js';
import { createIndoorLayers } from './indoor/layers.js';
import { floorManagement } from './indoor/floorManagement.js';
import { setupSearch } from './search/autocomplete.js';
import { fixPath } from './misc/fixPath.js';
import './styles/index.css';

const map = createMap('map');

window.map = map;

addIndoorTo(map);

map.addControl(new NavigationControl(), 'top-right');

const geolocateBtn = geolocateControl(map)

map.addControl(geolocateBtn, 'top-right');

setupSearch(map);

map.on('load', async () => {
  geolocateBtn.trigger();

  map.addControl(new floorManagement());

  const data = await fetch(fixPath('data/indoor/latest.geojson'));
  const geojson = fixLevels(await data.json());

  map.indoor.addMap(IndoorMap.fromGeojson(geojson, { layers: createIndoorLayers() }));
});

window.closeBanner = function() {
  const banner = document.getElementById('banner');
  const main = document.getElementById('main');
  
  banner.style.display = 'none';
  //main.style.height = '100vh'; 
};
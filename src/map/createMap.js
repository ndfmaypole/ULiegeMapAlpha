import { Map, setWorkerUrl } from 'maplibre-gl';
import { fixPath } from '../misc/fixPath';

setWorkerUrl(fixPath('/assets/maplibre-gl-worker.mjs'));

export function createMap(container) {
  return new Map({
    container,
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [5.566431, 50.583931],
    zoom: 16.5,
    hash: true
  });
}

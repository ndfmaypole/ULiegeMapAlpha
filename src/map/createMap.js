import { Map, setWorkerUrl } from 'maplibre-gl';

setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href);

export function createMap(container) {
  return new Map({
    container,
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [5.566431, 50.583931],
    zoom: 16.5,
    hash: true
  });
}

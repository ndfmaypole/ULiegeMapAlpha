import { GeolocateControl } from 'maplibre-gl';


// gère la géolocalisation et l'update
export function geolocateControl(map) {
  const control = new GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true,
    showAccuracyCircle: true
  });

  control.on('geolocate', ({ coords }) => {
    const camera = {
      center: [coords.longitude, coords.latitude],
      zoom: 18,
      duration: 500
    };

    if (Number.isFinite(coords.heading)) {
      camera.bearing = coords.heading;
    }

    map.easeTo(camera);
  });

  return control;
}

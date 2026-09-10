// parcourt un tableau de coordonnées pour calculer la bbox d'une géométrie
function coordinateslimits(coordinates, limits = {
  minLng: Infinity,
  minLat: Infinity,
  maxLng: -Infinity,
  maxLat: -Infinity
}) {
  limits.minLng = Math.min(limits.minLng, coordinates[0]);
  limits.maxLng = Math.max(limits.maxLng, coordinates[0]);
  limits.minLat = Math.min(limits.minLat, coordinates[1]);
  limits.maxLat = Math.max(limits.maxLat, coordinates[1]);
  return limits;
}

// vérifie si la bbox d'une feature intersecte avec les limites du viewport
function featureIntersectsViewport(feature, viewport) {
  const limits = coordinateslimits(feature.geometry.coordinates);
  return limits.maxLng >= viewport.getWest()
    && limits.minLng <= viewport.getEast()
    && limits.maxLat >= viewport.getSouth()
    && limits.minLat <= viewport.getNorth();
}

// gère automatiquement les étages par % au viewport (IA)
export class floorManagement {
  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this.update = this.update.bind(this);
    map.on('moveend', this.update);
    map.on('indoor.map.loaded', this.update);
    map.on('indoor.level.changed', this.update);
    this.update();
    return this.container;
  }

  onRemove() {
    this.map.off('moveend', this.update);
    this.map.off('indoor.map.loaded', this.update);
    this.map.off('indoor.level.changed', this.update);
    this.container.remove();
    this.map = undefined;
  }

  update() {
    const indoorMap = this.map.indoor.getSelectedMap();
    const viewport = this.map.getBounds();
    const levels = new Set();

    // filtre les batiments et détecte leurs levels
    indoorMap?.geojson.features
      .filter((feature) => feature.geometry && feature.properties?.level !== undefined)
      .filter((feature) => featureIntersectsViewport(feature, viewport))
      .forEach((feature) => levels.add(Number(feature.properties.level)));

    this.container.replaceChildren(); // efface les boutons de contrôle existants

    // trie les levels et génère le control
    [...levels].filter(Number.isFinite).sort((a, b) => b - a).forEach((level) => {
      const button = document.createElement('button');
      button.className = 'mapboxgl-ctrl-icon';
      button.type = 'button';
      button.textContent = String(level);
      button.title = `Afficher le niveau ${level}`;
      button.setAttribute('aria-label', `Afficher le niveau ${level}`);
      button.addEventListener('click', () => this.map.indoor.setLevel(level));
      if (this.map.indoor.getLevel() === level) button.style.fontWeight = 'bold';
      this.container.appendChild(button);
    });

    this.container.style.display = levels.size ? 'block' : 'none';
  }
}

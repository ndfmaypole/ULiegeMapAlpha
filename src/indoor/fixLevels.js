// fix les multi levels et repeat_on
export function fixLevels(geojson) {
  return {
    ...geojson,
    features: geojson.features.flatMap((feature) => {
      const properties = feature.properties || {};
      const levels = getFeatureLevels(properties);

      if (levels.length === 0) {
        return [{
          ...feature,
          properties: { ...properties, is_multi_level: false }
        }];
      }

      return levels.map((level) => ({
        ...feature,
        properties: {
          ...properties,
          level: String(level),
          is_multi_level: levels.length > 1
        }
      }));
    })
  };
}

// extrait les levels d'une feature
function getFeatureLevels(properties) {
  const levelValues = [properties.level, properties.repeat_on]
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .map(String);

  return [...new Set(
    levelValues
      .flatMap((value) => value.split(';'))
      .map(Number)
      .filter(Number.isFinite)
  )].sort((a, b) => a - b);
}

import { codeValues } from "../search/autocomplete";

// si une feature a plusieurs niveau, zoomer sur son niveau normal (dans le code)
function extraRoomLevel(tags) {
  for (const value of codeValues(tags)) {
    const level = parseInt(value.split('/')[0], 10);
    if (!Number.isNaN(level)) return level;
  }
  return null;
}

export function setLevel(map, tags,) {
    let level = Number(tags.level)
    if (!level)
        level = extraRoomLevel(tags);
    map.indoor.setLevel(level);
}
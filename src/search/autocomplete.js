import { fixPath } from "../misc/fixPath";
import { setLevel } from "../indoor/setLevel";

const dataPath = '/data/search/latest.json';
const data = fixPath(dataPath)
const roomZoom = 20;
const buildingZoom = 18.5;

function tagValues(tags, key) {
  const value = tags?.[key];
  if (Array.isArray(value)) return value.map(String);
  return value === undefined ? [] : [String(value)];
}

function searchableText(tags) {
  return Object.values(tags || {})
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function nameText(tags) {
  return ['name', 'short_name', 'alt_name']
    .flatMap((key) => tagValues(tags, key))
    .join(' ')
    .toLowerCase();
}

export function codeValues(tags) {
  return ['ref', 'official_ref']
    .flatMap((key) => tagValues(tags, key))
    .map((value) => value.toLowerCase());
}

// recherche stricte pour le code 
function codeMatches(tags, query) {
  return codeValues(tags).some((value) => value.startsWith(query));
}

function itemLabel(item) {
  const tags = item.tags || {};
  return tagValues(tags, 'name')[0]
    || tagValues(tags, 'ref')[0]
    || tagValues(tags, 'official_ref')[0]
}

// montre seulement le code
function itemCodeLabel(item, fallback) {
  const tags = item.tags || {};
  return tagValues(tags, 'ref')[0]
    || tagValues(tags, 'official_ref')[0]
    || fallback;
}

function clearResults(resultsElement) {
  resultsElement.replaceChildren();
}

function showResults(input, resultsElement, items, selectItem) {
  clearResults(resultsElement);

  items.slice(0, 12).forEach((item) => {
    const result = document.createElement('button');
    result.type = 'button';
    result.className = 'search-item';
    result.textContent = item.label;
    result.addEventListener('mousedown', (event) => event.preventDefault());
    result.addEventListener('click', () => {
      input.value = item.label;
      clearResults(resultsElement);
      selectItem(item.value);
    });
    resultsElement.appendChild(result);
  });
}

function connectAutocomplete(input, results, findMatches, selectItem) {
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      clearResults(results);
      return;
    }
    showResults(input, results, findMatches(query), selectItem);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => clearResults(results), 150);
  });
}

export async function setupSearch(map) {
  const response = await fetch(data);
  const json = await response.json();

  const buildingInput = document.querySelector('#input-building');
  const buildingResults = document.querySelector('#results-building');
  const nameInput = document.querySelector('#input-name');
  const nameResults = document.querySelector('#results-name');
  const codeInput = document.querySelector('#input-code');
  const codeResults = document.querySelector('#results-code');

  let selectedBuilding = null;
  codeInput.disabled = true;

  const buildings = json.buildings || [];
  const allRooms = buildings.flatMap((building) => (
    building.content || []
  ).map((room) => ({ room, building })));

  function zoomTo(point, zoom) {
    if (!Array.isArray(point) || point.length < 2) return;
    map.easeTo({ center: point, zoom, duration: 700 });
  }


  function goToRoom(room) {
    zoomTo(room.centre, roomZoom);
    setLevel(map, room.tags);
  }

  function resetBuildingScopedInputs() {
    selectedBuilding = null;
    codeInput.disabled = true;
    codeInput.value = '';
    clearResults(codeResults);
  }

  connectAutocomplete(
    buildingInput,
    buildingResults,
    (query) => buildings
      .filter((building) => searchableText({
        ...building.tags,
        ref: building.ref
      }).includes(query))
      .map((building) => ({
        label: itemLabel(building),
        value: building
      })),
    (building) => {
      selectedBuilding = building;
      codeInput.disabled = false;
      nameInput.value = '';
      codeInput.value = '';
      clearResults(nameResults);
      clearResults(codeResults);
      zoomTo(building.centre, buildingZoom);
    }
  );

  buildingInput.addEventListener('input', () => {
    resetBuildingScopedInputs();
  });

  // recherche du nom qui peut êter filtrée par bât
  connectAutocomplete(
    nameInput,
    nameResults,
    (query) => {
      const rooms = selectedBuilding
        ? (selectedBuilding.content || []).map((room) => ({ room, building: selectedBuilding }))
        : allRooms;
      return rooms
        .filter(({ room }) => nameText(room.tags).includes(query))
        .map(({ room, building }) => ({
          label: `${building.ref} ${room.tags.name} (${room.tags.ref})`,
          value: { room, building }
        }));
    },
    ({ room }) => goToRoom(room)
  );

  // recherche du code seul. avec bât
  connectAutocomplete(
    codeInput,
    codeResults,
    (query) => {
      if (!selectedBuilding) return [];
      return (selectedBuilding.content || [])
        .filter((room) => codeMatches(room.tags, query))
        .map((room) => ({
          label: itemCodeLabel(room),
          value: { room, building: selectedBuilding }
        }));
    },
    ({ room }) => goToRoom(room)
  );
}
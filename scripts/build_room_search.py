import json
from shapely.geometry import shape

with open("../public/data/indoor/latest.geojson", "r", encoding="utf-8") as f:
    geojson = json.load(f)

buildingShapes = []
indoorShapes = []
features = []
buildings = []

for obj in geojson["features"]:
    properties = obj.get("properties")
    if not properties:
        continue
    geometry = shape(obj["geometry"])

    if "building" in properties and geometry.geom_type in ["Polygon", "MultiPolygon"]:
        buildingShapes.append((properties, geometry))
    elif "indoor" in properties and geometry.geom_type in ["Point", "Polygon", "MultiPolygon"]:
        indoorShapes.append((properties, geometry))

for bProps, bGeom in buildingShapes:
    id = bProps.get("@id")
    position = bGeom.centroid
    centre = [position.x, position.y]

    bProps.pop("@id", None)

    buildings.append({
        "id": id,
        "ref": bProps.get("ref"),
        "centre": centre,
        "tags": bProps,
        "content": []
    })

for iProps, iGeom in indoorShapes:
    for bProps, bGeom in buildingShapes:
        if bGeom.contains(iGeom):
            id = iProps.get("@id")
            ref = iProps.get("ref")
            officialRef = iProps.get("official_ref")
            name = iProps.get("name")
            shortName = iProps.get("short_name")
            altName = iProps.get("alt_name")
            level = iProps.get("level")

            bRef = bProps.get("ref")
            building =  next((item for item in buildings if item.get("ref") == bRef), None)
            position = iGeom.centroid
            centre = [position.x, position.y]

            iProps.pop("@id", None)

            """features.append({
                "id": id,
                "building": bRef,
                "centre": centre,
                "tags": iProps
            })"""

            if ref:
                tags = { "ref": ref.split(";") }

                tags.update({
                    key: tag for key, tag in {
                        "official_ref": officialRef.split(";") if officialRef else None,
                        "name": name,
                        "short_name": shortName,
                        "alt_name": altName,
                        "level": level,
                        }.items() if tag
                    })

                building.get("content").append({
                    "id": id,
                    "centre": centre,
                    "tags": tags
                })

                break

with open("../public/data/search/latest.json", "w", encoding="utf-8") as o:
	json.dump({ "buildings": buildings, "features": features }, o, indent=2, ensure_ascii=False)
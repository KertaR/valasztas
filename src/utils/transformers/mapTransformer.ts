import { geoArea } from 'd3-geo';

interface RawPolygonData {
    maz: string;
    evk: number;
    poligon: string;
    [key: string]: any;
}

export const processOevkPolygons = (oevkPoligonokData: any): any => {
    // 1. Eset: bejövő adat már egy szerializált GeoJSON (FeatureCollection) az API-ból
    if (oevkPoligonokData && oevkPoligonokData.type === 'FeatureCollection') {
        return oevkPoligonokData;
    }

    // 2. Eset: bejövő adat egy NVI-s raw JSON objektum, aminek van "features" tömbje
    if (oevkPoligonokData && Array.isArray(oevkPoligonokData.features)) {
        return {
            type: 'FeatureCollection',
            features: oevkPoligonokData.features
        };
    }

    // 3. Eset: NVI nyers tömb formátum (list). Ez jöhet API-ból vagy fájlfeltöltésből.
    const featuresArray: RawPolygonData[] = Array.isArray(oevkPoligonokData)
        ? oevkPoligonokData
        : (oevkPoligonokData?.list || []);

    return {
        type: 'FeatureCollection',
        features: featuresArray.map(p => {
            if (!p.poligon) return null;

            // NVI formátum: "lat lon,lat lon,..."
            // GeoJSON elvárás: [[lon, lat], [lon, lat], ...]
            const coords = p.poligon.split(',').map(pair => {
                const pts = pair.trim().split(/\s+/);
                if (pts.length < 2) return null;
                const lat = parseFloat(pts[0]);
                const lon = parseFloat(pts[1]);
                if (isNaN(lat) || isNaN(lon)) return null;
                return [lon, lat];
            }).filter((c): c is [number, number] => c !== null);

            if (coords.length < 3) return null;

            // GeoJSON poligon gyűrűnek zártnak kell lennie (első pont = utolsó pont)
            if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
                coords.push(coords[0]);
            }

            const feature: any = {
                type: 'Feature',
                id: `oevk-${p.maz}-${p.evk}`,
                properties: {
                    maz: p.maz,
                    evk: p.evk,
                    name: `${p.maz}-${p.evk}`
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [coords]
                }
            };

            // d3-geo gömbfelületi terület alapú javítás
            if (geoArea(feature) > 2 * Math.PI) {
                feature.geometry.coordinates[0].reverse();
            }

            return feature;
        }).filter(Boolean)
    };
};

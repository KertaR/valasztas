const fs = require('fs');
const rewind = require('@turf/rewind').default;

const oevkData = JSON.parse(fs.readFileSync('public/data/OevkPoligonok.json', 'utf8'));
const megyekData = JSON.parse(fs.readFileSync('public/data/Megyek.json', 'utf8'));

// Készítsünk egy megye_nev lookup tálbát
const megyeMap = {};
megyekData.list.forEach(m => {
    if (m.leiro && m.leiro.maz) {
        megyeMap[m.leiro.maz] = m.leiro.nevi;
    }
});

const features = oevkData.list.map(m => {
    if (!m.poligon) return null;
    const coords = m.poligon.split(',').map(pair => {
        const [lat, lon] = pair.trim().split(' ').map(Number);
        return [lon, lat]; // GeoJSON is [lon, lat]
    });

    const maz = String(m.maz).padStart(2, '0');
    const evk = String(m.evk).padStart(2, '0');

    return {
        type: 'Feature',
        properties: {
            maz: maz,
            evk: evk,
            name: megyeMap[maz] ? `${megyeMap[maz]}, ${evk}. oevk.` : `${maz}-${evk}`
        },
        geometry: {
            type: 'Polygon',
            coordinates: [coords]
        }
    };
}).filter(Boolean);

const geojson = {
    type: 'FeatureCollection',
    features
};

const rewound = rewind(geojson, { reverse: true });
fs.writeFileSync('public/oevk.json', JSON.stringify(rewound));
fs.writeFileSync('src/assets/oevk.json', JSON.stringify(rewound));
console.log('Created oevk.json with ' + features.length + ' features');

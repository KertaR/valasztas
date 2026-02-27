const fs = require('fs');
const rewind = require('@turf/rewind').default;

const geojsonPath = './src/assets/oevk.json';
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// D3/react-simple-maps expects clockwise polygons (right-hand rule for spherical interior)
// but standard GeoJSON (RFC 7946) says exterior rings should be counter-clockwise.
// Depending on how d3 parses, let's reverse whatever it is by default, or use turf rewind.
// turf's rewind with reverse=true ensures standard D3 orientation (right-hand rule spherical).
const fixedGeojson = rewind(geojson, { reverse: true, mutate: false });

fs.writeFileSync(geojsonPath, JSON.stringify(fixedGeojson));
fs.writeFileSync('./public/oevk.json', JSON.stringify(fixedGeojson));

console.log('GeoJSON winding order has been fixed and saved.');

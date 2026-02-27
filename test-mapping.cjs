async function testMapping() {
    const fs = require('fs');

    // 1. Fetch live data
    console.log("Fetching live data...");
    const dataUrl = 'http://localhost:5173/api/nvi-data';
    const response = await fetch(dataUrl);
    const data = await response.json();

    const jeloltek = data.valasztas_jelolt_lista.jeloltek_sora;
    const keruletek = data.valasztas_jelolt_lista.valasztokeruletek_sora;

    console.log(`Loaded ${jeloltek.length} candidates and ${keruletek.length} districts.`);

    // 2. Load GeoJSON
    const oevkPath = './src/assets/oevk.json';
    const geojson = JSON.parse(fs.readFileSync(oevkPath, 'utf8'));

    // 3. Setup mapping function
    const mapOevkNameToMazEvk = (name) => {
        const match = name.match(/^(.+?)\s+(\d+)$/);
        if (!match) return null;

        const megyeNev = match[1].toLowerCase().trim();
        const evk = parseInt(match[2], 10);

        const megyeMap = {
            'budapest': '01',
            'baranya': '02',
            'bács-kiskun': '03',
            'békés': '04',
            'borsod-abaúj-zemplén': '05',
            'csongrád-csanád': '06',
            'fejér': '07',
            'győr-moson-sopron': '08',
            'hajdú-bihar': '09',
            'heves': '10',
            'komárom-esztergom': '11',
            'nógrád': '12',
            'pest': '13',
            'somogy': '14',
            'szabolcs-szatmár-bereg': '15',
            'jász-nagykun-szolnok': '16',
            'tolna': '17',
            'vas': '18',
            'veszprém': '19',
            'zala': '20'
        };

        const maz = megyeMap[megyeNev];
        if (maz) {
            return { maz: parseInt(maz, 10), evk };
        }
        return null;
    };

    // 4. Test mapping for "Budapest 01"
    const testName = "Budapest 01";
    const mappedIds = mapOevkNameToMazEvk(testName);
    console.log(`\nMapping for ${testName}:`, mappedIds);

    // 5. Try finding district
    const districtStrict = keruletek.find(d => d.maz === mappedIds.maz && d.evk === mappedIds.evk);
    console.log('Strict match for district:', districtStrict ? true : false);

    // In our code we parse it
    const districtParsed = keruletek.find(d => parseInt(d.leiro.maz, 10) === mappedIds.maz && parseInt(d.leiro.evk, 10) === mappedIds.evk);
    console.log('Parsed match for district:', districtParsed ? true : false);

    if (districtParsed) {
        console.log('District details:', Object.keys(districtParsed), districtParsed.leiro);
    }

    // 6. Try finding candidates
    const candParsed = jeloltek.filter(c => parseInt(c.maz, 10) === mappedIds.maz && parseInt(c.evk, 10) === mappedIds.evk);
    console.log(`Found ${candParsed.length} candidates for ${testName}.`);

    if (candParsed.length > 0) {
        console.log('Sample candidate:', candParsed[0]);
    } else {
        // Let's see what a candidate looks like
        console.log('Random candidate to see structure:', jeloltek[0]);
    }
}

testMapping().catch(console.error);

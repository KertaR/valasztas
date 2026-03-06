import fs from 'fs';

async function test() {
    try {
        const configReq = await fetch('https://vtr.valasztas.hu/ogy2026/data/config.json');
        const config = await configReq.json();

        const url = `https://vtr.valasztas.hu/ogy2026/data/${config.ver}/ver/OevkPoligonok.json`;
        const res = await fetch(url);
        const data = await res.json();

        console.log('poligon type:', typeof data.list[0].poligon);
        console.log('poligon snippet:', typeof data.list[0].poligon === 'string' ? data.list[0].poligon.substring(0, 50) : 'not string');
    } catch (e) {
        console.error(e);
    }
}
test();

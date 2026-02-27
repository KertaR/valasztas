import { useState } from 'react';
import { getNviUrls, NVI_DATE, NVI_DATE_YESTERDAY, PROXIES, CONFIG_URL } from '../utils/constants';

export function useElectionData(showToast, onClearCallback) {
    const [data, setData] = useState({
        megyek: null,
        telepulesek: null,
        oevk: null,
        jeloltek: null,
        szervezetek: null,
        oevkPoligonok: null
    });
    const [yesterdayData, setYesterdayData] = useState(null);
    const [isLoadingWeb, setIsLoadingWeb] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const isAllUploaded = Object.values(data).every(val => val !== null);

    const fetchDataFromWeb = async () => {
        setIsLoadingWeb(true);
        setFetchError(null);

        try {
            const fetchJson = async (baseUrl) => {
                for (let i = 0; i < PROXIES.length; i++) {
                    const proxy = PROXIES[i];
                    try {
                        let finalUrl = baseUrl;
                        if (proxy === 'https://corsproxy.io/?') {
                            finalUrl = proxy + baseUrl;
                        } else if (proxy !== '') {
                            finalUrl = proxy + encodeURIComponent(baseUrl);
                        }

                        const res = await fetch(finalUrl);
                        if (res.ok) {
                            return await res.json();
                        }
                    } catch (e) {
                        // A natív fetch hiba (CORS) localhoston normális, ne ijesszük meg a felhasználót
                        if (i === 0) {
                            console.log(`💡 Közvetlen kapcsolat (CORS) nem lehetséges, váltás biztonságos csatornára (Proxy)...`);
                        } else {
                            console.warn(`⚠️ Proxy hiba (${proxy}), próbálkozás a következővel...`);
                        }
                        continue;
                    }
                }
                throw new Error('Minden elérési út elbukott. Kérlek töltsd fel a fájlokat manuálisan.');
            };

            // 1. Fetch current version config
            let currentVer = NVI_DATE; // Fallback calculated string
            try {
                const configData = await fetchJson(CONFIG_URL);
                if (configData && configData.ver) {
                    currentVer = configData.ver;
                }
            } catch (e) {
                console.warn("Nem sikerült letölteni a config.json-t, használjuk az alapértelmezett dátumot:", e);
            }

            const currentUrls = getNviUrls(currentVer);
            const yesterdayUrls = getNviUrls(NVI_DATE_YESTERDAY);

            const [megyek, telepulesek, oevk, jeloltek, szervezetek, oevkPoligonok] = await Promise.all([
                fetchJson(currentUrls.megyek),
                fetchJson(currentUrls.telepulesek),
                fetchJson(currentUrls.oevk),
                fetchJson(currentUrls.jeloltek),
                fetchJson(currentUrls.szervezetek),
                fetchJson(currentUrls.oevkPoligonok)
            ]);

            // Próbáljuk letölteni a tegnapi adatokat is
            let yesterdayMegyek, yesterdayTelepulesek, yesterdayOevk, yesterdayJeloltek, yesterdaySzervezetek;
            try {
                [yesterdayMegyek, yesterdayTelepulesek, yesterdayOevk, yesterdayJeloltek, yesterdaySzervezetek] = await Promise.all([
                    fetchJson(yesterdayUrls.megyek),
                    fetchJson(yesterdayUrls.telepulesek),
                    fetchJson(yesterdayUrls.oevk),
                    fetchJson(yesterdayUrls.jeloltek),
                    fetchJson(yesterdayUrls.szervezetek)
                ]);
                setYesterdayData({
                    megyek: yesterdayMegyek.list || [],
                    telepulesek: yesterdayTelepulesek.list || [],
                    oevk: yesterdayOevk.list || [],
                    jeloltek: yesterdayJeloltek.list || [],
                    szervezetek: yesterdaySzervezetek.list || []
                });
            } catch (e) {
                console.warn("Tegnapi adatok nem elérhetőek:", e);
                setYesterdayData(null);
            }

            setData({
                megyek: megyek.list || [],
                telepulesek: telepulesek.list || [],
                oevk: oevk.list || [],
                jeloltek: jeloltek.list || [],
                szervezetek: szervezetek.list || [],
                oevkPoligonok: oevkPoligonok.list || []
            });
            showToast('Élő adatok sikeresen betöltve az NVI szerveréről!');
        } catch (err) {
            console.error("Fetch hiba:", err);
            setFetchError("Nem sikerült letölteni az adatokat a szerverről. Kérlek, használd a manuális fájlfeltöltést (a böngésző CORS beállításai blokkolhatják a kérést).");
        } finally {
            setIsLoadingWeb(false);
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        setFetchError(null);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    const listData = json.list || [];
                    setData(prev => {
                        const newData = { ...prev };
                        if (file.name.includes('Megyek')) newData.megyek = listData;
                        else if (file.name.includes('Telepulesek')) newData.telepulesek = listData;
                        else if (file.name.includes('OevkAdatok')) newData.oevk = listData;
                        else if (file.name.includes('EgyeniJeloltek')) newData.jeloltek = listData;
                        else if (file.name.includes('Szervezetek')) newData.szervezetek = listData;
                        else if (file.name.includes('OevkPoligonok')) newData.oevkPoligonok = listData;

                        const isNowComplete = Object.values(newData).every(val => val !== null);
                        if (isNowComplete && !isAllUploaded) showToast('Minden fájl sikeresen feldolgozva!');
                        return newData;
                    });
                } catch (error) {
                    console.error("Hiba a fájl olvasásakor:", file.name, error);
                    alert(`Hiba történt a(z) ${file.name} feldolgozása közben.`);
                }
            };
            reader.readAsText(file);
        });
    };

    const clearData = () => {
        setData({ megyek: null, telepulesek: null, oevk: null, jeloltek: null, szervezetek: null, oevkPoligonok: null });
        setFetchError(null);
        if (onClearCallback) onClearCallback();
    };

    return {
        data,
        yesterdayData,
        isLoadingWeb,
        fetchError,
        isAllUploaded,
        fetchDataFromWeb,
        handleFileUpload,
        clearData
    };
}

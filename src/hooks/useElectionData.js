import { useState, useEffect, useRef } from 'react';
import { getNviUrls, NVI_DATE, NVI_DATE_YESTERDAY, CONFIG_URL } from '../utils/constants';

export function useElectionData(showToast, onClearCallback) {
    const [data, setData] = useState({
        megyek: null,
        telepulesek: null,
        oevk: null,
        jeloltek: null,
        szervezetek: null,
        oevkPoligonok: null,
        listakEsJeloltek: null
    });
    const [yesterdayData, setYesterdayData] = useState(null);
    const [isLoadingWeb, setIsLoadingWeb] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(() => {
        return localStorage.getItem('valasztas_auto_refresh') === 'true';
    });
    const autoRefreshRef = useRef(autoRefresh);
    autoRefreshRef.current = autoRefresh;

    const isAllUploaded = Object.values(data).every(val => val !== null);

    const fetchDataFromWeb = async () => {
        setIsLoadingWeb(true);
        setFetchError(null);

        try {
            const fetchJson = async (url) => {
                // Determine the correct URL based on environment (Vite DEV vs Vercel PROD).
                // In local Vite dev, we need the absolute URL to bypass cors (though local handles it).
                // Actually, Vite supports proxy rules in vite.config.js, or we can just hope public API allows localhost.
                // If the app is hosted on Vercel, relative paths hit the vercel.json rewrites.
                try {
                    const res = await fetch(url);
                    if (res.ok) {
                        return await res.json();
                    }
                    throw new Error(`HTTP error! status: ${res.status} when fetching ${url}`);
                } catch (e) {
                    console.warn(`Hiba történt a(z) ${url} cím lekérésekor:`, e);
                    throw e; // Propagate error outwards
                }
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

            const [megyek, telepulesek, oevk, jeloltek, szervezetek, oevkPoligonok, listakEsJeloltek] = await Promise.all([
                fetchJson(currentUrls.megyek),
                fetchJson(currentUrls.telepulesek),
                fetchJson(currentUrls.oevk),
                fetchJson(currentUrls.jeloltek),
                fetchJson(currentUrls.szervezetek),
                fetchJson(currentUrls.oevkPoligonok),
                fetchJson(currentUrls.listakEsJeloltek).catch(() => ({ list: null })) // Opcionális, megnézzük hátha elbukik (404)
            ]);

            // Próbáljuk letölteni a tegnapi adatokat is
            let yesterdayMegyek, yesterdayTelepulesek, yesterdayOevk, yesterdayJeloltek, yesterdaySzervezetek, yesterdayListakEsJeloltek;
            try {
                [yesterdayMegyek, yesterdayTelepulesek, yesterdayOevk, yesterdayJeloltek, yesterdaySzervezetek, yesterdayListakEsJeloltek] = await Promise.all([
                    fetchJson(yesterdayUrls.megyek),
                    fetchJson(yesterdayUrls.telepulesek),
                    fetchJson(yesterdayUrls.oevk),
                    fetchJson(yesterdayUrls.jeloltek),
                    fetchJson(yesterdayUrls.szervezetek),
                    fetchJson(yesterdayUrls.listakEsJeloltek).catch(() => ({ list: null })) // Opcionális, mivel lehet, hogy hiányzik
                ]);
                setYesterdayData({
                    megyek: yesterdayMegyek.list || [],
                    telepulesek: yesterdayTelepulesek.list || [],
                    oevk: yesterdayOevk.list || [],
                    jeloltek: yesterdayJeloltek.list || [],
                    szervezetek: yesterdaySzervezetek.list || [],
                    listakEsJeloltek: yesterdayListakEsJeloltek?.list || []
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
                oevkPoligonok: oevkPoligonok.features ? oevkPoligonok : (oevkPoligonok.list || []),
                listakEsJeloltek: listakEsJeloltek?.list || []
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
                        else if (file.name.includes('OevkPoligonok')) newData.oevkPoligonok = json.features ? json : listData;
                        else if (file.name.includes('ListakEsJeloltek')) newData.listakEsJeloltek = listData;

                        const isNowComplete = Object.values(newData).every(val => val !== null);
                        const wasCompleteBefore = Object.values(prev).every(val => val !== null);

                        if (isNowComplete && !wasCompleteBefore) {
                            showToast('Minden fájl sikeresen feldolgozva!');
                        }

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


    // Auto-refresh logika: 10 percenként frissíti az adatokat, ha engedélyezve van

    useEffect(() => {
        localStorage.setItem('valasztas_auto_refresh', autoRefresh);
        if (!autoRefresh) return;

        const AUTO_REFRESH_MS = 10 * 60 * 1000; // 10 perc
        const interval = setInterval(() => {
            if (autoRefreshRef.current) {
                fetchDataFromWeb();
            }
        }, AUTO_REFRESH_MS);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh]);

    const clearData = () => {
        setData({ megyek: null, telepulesek: null, oevk: null, jeloltek: null, szervezetek: null, oevkPoligonok: null, listakEsJeloltek: null });
        setFetchError(null);
        setLastFetchTime(null);
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
        clearData,
        lastFetchTime,
        autoRefresh,
        setAutoRefresh
    };
}

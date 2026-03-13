import { useState, useEffect, useRef } from 'react';
import { getNviUrls, NVI_DATE, NVI_DATE_YESTERDAY, CONFIG_URL } from '../utils/constants';
import { NVIMegye, NVITelepules, NVIOevk, NVIJelolt, NVISzervezet } from '../types/nvi';

export interface ElectionDataState {
    megyek: NVIMegye[] | null;
    telepulesek: NVITelepules[] | null;
    oevk: NVIOevk[] | null;
    jeloltek: NVIJelolt[] | null;
    szervezetek: NVISzervezet[] | null;
    oevkPoligonok: any | null;
    listakEsJeloltek: any[] | null;
}

export interface YesterdayDataState {
    megyek: any[];
    telepulesek: any[];
    oevk: any[];
    jeloltek: any[];
    szervezetek: any[];
    listakEsJeloltek: any[];
}

export function useElectionData(showToast: (msg: string) => void, onClearCallback?: () => void) {
    const [data, setData] = useState<ElectionDataState>({
        megyek: null,
        telepulesek: null,
        oevk: null,
        jeloltek: null,
        szervezetek: null,
        oevkPoligonok: null,
        listakEsJeloltek: null
    });
    const [yesterdayData, setYesterdayData] = useState<YesterdayDataState | null>(null);
    const [isLoadingWeb, setIsLoadingWeb] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
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
            const fetchJson = async (url: string) => {
                try {
                    const res = await fetch(url);
                    if (res.ok) {
                        return await res.json();
                    }
                    throw new Error(`HTTP error! status: ${res.status} when fetching ${url}`);
                } catch (e) {
                    console.warn(`Hiba történt a(z) ${url} cím lekérésekor:`, e);
                    throw e;
                }
            };

            let currentVer = NVI_DATE;
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
                fetchJson(currentUrls.listakEsJeloltek).catch(() => ({ list: null }))
            ]);

            let yesterdayMegyek, yesterdayTelepulesek, yesterdayOevk, yesterdayJeloltek, yesterdaySzervezetek, yesterdayListakEsJeloltek;
            try {
                [yesterdayMegyek, yesterdayTelepulesek, yesterdayOevk, yesterdayJeloltek, yesterdaySzervezetek, yesterdayListakEsJeloltek] = await Promise.all([
                    fetchJson(yesterdayUrls.megyek),
                    fetchJson(yesterdayUrls.telepulesek),
                    fetchJson(yesterdayUrls.oevk),
                    fetchJson(yesterdayUrls.jeloltek),
                    fetchJson(yesterdayUrls.szervezetek),
                    fetchJson(yesterdayUrls.listakEsJeloltek).catch(() => ({ list: null }))
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
            setLastFetchTime(new Date());
            showToast('Élő adatok sikeresen betöltve az NVI szerveréről!');
        } catch (err) {
            console.error("Fetch hiba:", err);
            setFetchError("Nem sikerült letölteni az adatokat a szerverről. Kérlek, használd a manuális fájlfeltöltést (a böngésző CORS beállításai blokkolhatják a kérést).");
        } finally {
            setIsLoadingWeb(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setFetchError(null);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!e.target) return;
                try {
                    const json = JSON.parse(e.target.result as string);
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

    useEffect(() => {
        localStorage.setItem('valasztas_auto_refresh', String(autoRefresh));
        if (!autoRefresh) return;

        const AUTO_REFRESH_MS = 10 * 60 * 1000;
        const interval = setInterval(() => {
            if (autoRefreshRef.current) {
                fetchDataFromWeb();
            }
        }, AUTO_REFRESH_MS);

        return () => clearInterval(interval);
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

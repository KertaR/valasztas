import { useState, useEffect } from 'react';
import { MapPin, Loader2, Users, AlertCircle, Accessibility, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDataContext } from '../../contexts';

export default function PollingStationsViewer({ selectedOevk, settlements }) {
    const { nviVer } = useDataContext();
    // 1. Szűrjük azokat a településeket, amik benne vannak ebben az OEVK-ban
    const oevkSettlements = settlements.filter(s => 
        s.leiro.maz === selectedOevk.maz && 
        s.leiro.evk_lst.includes(selectedOevk.evk)
    );

    const [selectedSettlement, setSelectedSettlement] = useState(
        oevkSettlements.length > 0 ? oevkSettlements[0] : null
    );
    const [pollingStations, setPollingStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!selectedSettlement) return;
        
        setLoading(true);
        setError(null);
        
        const maz = selectedSettlement.leiro.maz;
        const taz = selectedSettlement.leiro.taz;
        
        // A dinamikus VTR URL proxy-n keresztül (az nviVer a szerverről lekérdezett dátum verzió)
        const primaryUrl = `/api/nvi/${nviVer}/ver/${maz}/Szavazokorok-${maz}-${taz}.json`;
        const fallbackUrl = `/data/Szavazokorok-${maz}-${taz}.json`;
        
        fetch(primaryUrl)
            .then(res => {
                if (!res.ok) {
                    console.warn(`Primary URL nem elérhető: ${primaryUrl}. Próbálkozás a fallback URL-el: ${fallbackUrl}`);
                    return fetch(fallbackUrl).then(fbRes => {
                        if (!fbRes.ok) throw new Error(`A szavazókör adatok nem találhatók ehhez a településhez: ${selectedSettlement.leiro.megnev} (${maz}-${taz}). Ellenőrizd a VTR elérést vagy tölts fel egy helyi fájlt.`);
                        return fbRes;
                    });
                }
                return res;
            })
            .then(res => res.json())
            .then(data => {
                // Csak azokat a szavazóköröket tartjuk meg, amik a kiválasztott OEVK-hoz tartoznak
                const filtered = data.data.szavazokorok.filter(
                    szk => szk.leiro.evk === selectedOevk.evk
                );
                setPollingStations(filtered);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setPollingStations([]);
                setLoading(false);
            });
    }, [selectedSettlement, selectedOevk.evk, nviVer]);

    const filteredStations = pollingStations.filter(ps => 
        ps.leiro.szk_nev.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ps.leiro.cim.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ps.leiro.kozter.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (oevkSettlements.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 font-bold bg-white dark:bg-slate-900 flex-1 flex flex-col items-center justify-center min-h-[300px]">
                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                Nem találhatók települések ehhez a választókerülethez.
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
            {/* Fejléc és Település Választó */}
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center flex-shrink-0">
                <div className="flex flex-col gap-2 w-full sm:w-1/2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Település kiválasztása ({oevkSettlements.length} db)</label>
                    <select 
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm cursor-pointer"
                        value={selectedSettlement?.leiro.taz}
                        onChange={(e) => {
                            const found = oevkSettlements.find(s => s.leiro.taz === e.target.value);
                            if(found) setSelectedSettlement(found);
                        }}
                    >
                        {oevkSettlements.map(s => (
                            <option key={s.leiro.taz} value={s.leiro.taz}>
                                {s.leiro.megnev}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex flex-col gap-2 w-full sm:w-1/2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left sm:text-right">Keresés a szavazókörök között</label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Cím vagy sorszám alapján..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl pl-10 pr-4 py-2.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Tartalom */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="font-bold">Szavazókörök betöltése...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-amber-500 gap-3 py-12 max-w-md mx-auto text-center">
                        <AlertCircle className="w-12 h-12 text-amber-400/50" />
                        <div>
                            <p className="font-bold text-lg mb-1">Adatok nem elérhetők</p>
                            <p className="text-sm opacity-90 text-amber-600 dark:text-amber-400">{error}</p>
                            <div className="mt-4 text-xs bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-left leading-relaxed">
                                Jelenleg csak néhány teszt fájl van feltöltve a <code className="font-mono bg-black/10 px-1 py-0.5 rounded">public/data/</code> mappába (pl. Budapest 05. kerület, Alsózsolca, stb.). További adatokért be kell másolni a vonatkozó .json fájlokat.
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {filteredStations.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-500 font-bold bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                                <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                                Nem található szavazókör a keresési feltételekkel.
                            </div>
                        ) : (
                            filteredStations.map((szk, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                    key={szk.leiro.sorszam}
                                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow hover:border-blue-300 dark:hover:border-blue-700 transition-all relative overflow-hidden group flex flex-col h-full"
                                >
                                    {/* Left Border Accent */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500/80 group-hover:bg-blue-500 transition-colors"></div>
                                    
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="text-[10px] uppercase font-black tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                                                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                    {szk.leiro.sorszam}
                                                </span>
                                                Szavazókör
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] sm:text-base leading-tight mb-1">
                                                {szk.leiro.kozter}
                                            </h4>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2 mb-5 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                                        <span className="line-clamp-2">{szk.leiro.cim}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Jogosultak</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-black text-slate-800 dark:text-slate-200 leading-none">
                                                        {(szk.letszam.indulo || szk.letszam.osszesen).toLocaleString('hu-HU')} <span className="text-xs font-semibold text-slate-400">fő</span>
                                                    </div>
                                                    {(() => {
                                                        const totalVoters = szk.letszam.indulo || szk.letszam.osszesen;
                                                        if (!totalVoters) return null;
                                                        const perMin = totalVoters / 780;
                                                        return (
                                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/50 shrink-0" title="Átlagos érkezési sebesség (6:00 - 19:00)">
                                                                {perMin >= 1 ? `${perMin.toFixed(1)} fő/perc` : `${(totalVoters / 13).toFixed(1)} fő/óra`}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {szk.leiro.akadaly === 'I' ? (
                                            <div title="Akadálymentesített szavazókör" className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 cursor-help">
                                                <Accessibility className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div title="Nem akadálymentesített" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700/50 cursor-help opacity-40">
                                                <Accessibility className="w-4 h-4 opacity-50" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

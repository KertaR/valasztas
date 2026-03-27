import { useState, useMemo, Fragment, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, Users, Activity, Clock, ChevronDown, ChevronUp, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useDataContext, useUIContext } from '../contexts';

function SettlementRow({ settlement, evk }) {
    const { nviVer } = useDataContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const isShared = settlement.leiro.evk_lst && settlement.leiro.evk_lst.length > 1;

    // Ha a település több oevk-ba is belóg, nem használhatjuk a teljes lakosságot.
    // Ilyenkor megvárjuk, amíg a szavazókörök betöltenek, és összeadjuk az oevk-speciális szavazóköröket.
    const sVoters = (!isShared || hasLoaded) 
        ? (isShared ? stations.reduce((sum, szk) => sum + (szk.letszam?.indulo || szk.letszam?.osszesen || 0), 0) : (settlement.letszam?.indulo || 0))
        : null;

    const sPerMin = sVoters !== null ? sVoters / 780 : null;
    const sPerHour = sVoters !== null ? sVoters / 13 : null;

    const fetchStations = (expandAfter = false) => {
        if (hasLoaded || loading) {
            if (expandAfter) setIsExpanded(!isExpanded);
            return;
        }

        setLoading(true);
        const maz = settlement.leiro.maz;
        const taz = settlement.leiro.taz;
        
        const primaryUrl = `/api/nvi/${nviVer}/ver/${maz}/Szavazokorok-${maz}-${taz}.json`;
        const fallbackUrl = `/data/Szavazokorok-${maz}-${taz}.json`;
        
        fetch(primaryUrl)
            .then(res => {
                if (!res.ok) {
                    return fetch(fallbackUrl).then(fbRes => {
                        if (!fbRes.ok) throw new Error("A szavazókör adatok nem találhatók ehhez a településhez.");
                        return fbRes;
                    });
                }
                return res;
            })
            .then(res => res.json())
            .then(data => {
                const filtered = data.data.szavazokorok.filter(szk => szk.leiro.evk === evk);
                setStations(filtered);
                setLoading(false);
                setHasLoaded(true);
                if (expandAfter) setIsExpanded(!isExpanded);
            })
            .catch(err => {
                setError("Jelenleg nem áll rendelkezésre helyi adat a szavazókörre.");
                setLoading(false);
                if (expandAfter) setIsExpanded(!isExpanded);
            });
    };

    // Automatikusan lekérjük a szavazóköröket a háttérben, ha ez az OEVK sor lenyílik ÉS a település megosztott,
    // így a darab-matematika tökéletesen kijön (a felhasználó egy pillanatra látja a loadert, majd a pontos számokat).
    useEffect(() => {
        if (isShared && !hasLoaded && !loading && !error) {
            fetchStations(false);
        }
    }, [isShared, hasLoaded]);

    const handleToggle = () => {
        if (!hasLoaded) {
            fetchStations(true);
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
            <div 
                onClick={handleToggle} 
                className={`p-3 lg:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${isExpanded ? 'bg-slate-100 dark:bg-slate-800/80' : 'bg-white dark:bg-slate-800'}`}
            >
                <div className="flex items-center gap-3">
                    <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm lg:text-base">
                            {settlement.leiro.megnev}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Település • {isShared ? 'Részben az OEVK-ban' : `${settlement.leiro.szk_db} szavazókör`}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 lg:gap-8 text-right shrink-0">
                    <div className="hidden sm:block">
                        <div className="text-slate-800 dark:text-slate-200 font-bold text-sm lg:text-base">
                            {sVoters !== null ? (
                                `${sVoters.toLocaleString('hu-HU')} fő`
                            ) : (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline-block" />
                            )}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jogosultak</div>
                    </div>
                    <div className="w-24 lg:w-32">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm lg:text-base">
                            {sPerMin !== null ? (
                                sPerMin >= 1 ? `${sPerMin.toFixed(1)} fő/perc` : `${sPerHour.toFixed(1)} fő/óra`
                            ) : (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500 inline-block" />
                            )}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-emerald-500/70 tracking-wider">Érkezési sűrűség</div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50 dark:bg-slate-900"
                    >
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 text-slate-500 py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                    <span className="font-semibold text-sm">Szavazókörök betöltése...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center gap-2 text-amber-500 py-4 text-sm font-semibold">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            ) : stations.length === 0 ? (
                                <div className="text-slate-500 text-sm py-4 text-center font-semibold">
                                    Nincsenek elérhető szavazókörök az OEVK dűlőin.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {stations.map(szk => {
                                        const szkVs = szk.letszam.indulo || szk.letszam.osszesen;
                                        const szkPM = szkVs / 780;
                                        const szkPH = szkVs / 13;
                                        return (
                                            <div key={szk.leiro.sorszam} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="shrink-0 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border border-blue-200 dark:border-blue-800/50">
                                                        {szk.leiro.sorszam}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight mb-0.5">
                                                            {szk.leiro.kozter}
                                                        </div>
                                                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {szk.leiro.cim}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 lg:gap-8 bg-slate-50 dark:bg-slate-900/50 sm:bg-transparent p-2 sm:p-0 rounded-lg shrink-0">
                                                    <div className="text-left sm:text-right">
                                                        <div className="text-slate-700 dark:text-slate-300 font-bold text-sm tracking-tight">{szkVs} fő</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/50 inline-block shadow-sm">
                                                            {szkPM >= 1 ? `${szkPM.toFixed(1)} fő/perc` : `${szkPH.toFixed(1)} fő/óra`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function EvkTrafficTab() {
    const { enrichedData } = useDataContext();
    const { setSelectedOevk } = useUIContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    const districtsWithTraffic = useMemo(() => {
        let result = enrichedData.districts.map(d => {
            const voters = d.letszam?.indulo || 0;
            const perMin = voters / 780; // 6:00 - 19:00 = 13 hours = 780 minutes
            const perHour = voters / 13;
            
            return {
                ...d,
                voters,
                perMin,
                perHour
            };
        });

        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(d => {
                const matchesBasic = 
                    d.evk_nev.toLowerCase().includes(lowSearch) || 
                    d.maz_nev?.toLowerCase().includes(lowSearch) ||
                    d.szekhely?.toLowerCase().includes(lowSearch);
                
                if (matchesBasic) return true;

                // Keresés a települések között is, amik az adott OEVK-hoz tartoznak
                const matchesSettlement = enrichedData.settlements.some(s => 
                    s.leiro.maz === d.maz && 
                    s.leiro.evk_lst.includes(d.evk) &&
                    s.leiro.megnev.toLowerCase().includes(lowSearch)
                );

                return matchesSettlement;
            });
        }

        return result.sort((a, b) => b.voters - a.voters); // Sort by traffic descending
    }, [enrichedData.districts, enrichedData.settlements, searchTerm]);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Activity className="w-8 h-8 text-emerald-500" />
                        EVK Forgalmi Elemzés
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">Átlagos érkezési gyorsaság a 6:00-19:00 közötti 13 órás nyitvatartás alatt.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="relative w-full max-w-md">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Keresés választókerületre, megyére..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl pl-10 pr-4 py-2 font-medium shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] md:text-xs uppercase tracking-widest sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-black border-b border-slate-200 dark:border-slate-800">Választókerület</th>
                                <th className="p-4 font-black border-b border-slate-200 dark:border-slate-800">Székhely</th>
                                <th className="p-4 font-black border-b border-slate-200 dark:border-slate-800 text-right">Jogosultak</th>
                                <th className="p-4 font-black border-b border-slate-200 dark:border-slate-800 text-right text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10">Átlag Fő / Óra</th>
                                <th className="p-4 font-black border-b border-slate-200 dark:border-slate-800 text-right text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10">Átlag Fő / Perc</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm border-b border-slate-200 dark:border-slate-800">
                            {districtsWithTraffic.map(dist => {
                                const rowKey = `${dist.maz}-${dist.evk}`;
                                const isExpanded = expandedRow === rowKey;
                                
                                return (
                                    <Fragment key={rowKey}>
                                        <tr onClick={() => toggleRow(rowKey)} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate max-w-[280px]">
                                                            {dist.evk_nev}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            {dist.maz}-{dist.evk}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">
                                                {dist.szekhely}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="font-black text-slate-700 dark:text-slate-300">
                                                    {dist.voters.toLocaleString('hu-HU')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right bg-indigo-50/50 dark:bg-indigo-900/10">
                                                <div className="flex items-center justify-end gap-1.5 font-bold text-indigo-700 dark:text-indigo-400">
                                                    <span>{dist.perHour.toFixed(1)}</span>
                                                    <span className="text-[10px] text-indigo-500/70 border border-indigo-200 dark:border-indigo-700 px-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800/50">fő/óra</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right bg-emerald-50/50 dark:bg-emerald-900/10">
                                                <div className="flex items-center justify-end gap-1.5 font-black text-emerald-600 dark:text-emerald-400 text-base">
                                                    {dist.perMin >= 1 ? (
                                                        <>
                                                            <span>{dist.perMin.toFixed(1)}</span>
                                                            <span className="text-[10px] font-bold text-emerald-500/70 border border-emerald-200 dark:border-emerald-700 px-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/50">fő/perc</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">&lt; 1</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <tr className="bg-white dark:bg-slate-900">
                                                    <td colSpan="5" className="p-0 border-b-2 border-slate-200 dark:border-slate-800">
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }} 
                                                            animate={{ height: 'auto', opacity: 1 }} 
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pb-8 pt-4 px-4 lg:px-12 bg-slate-50/30 dark:bg-slate-900/30">
                                                                <div className="flex justify-between items-end mb-4 pr-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                                        <MapPin className="w-4 h-4 text-blue-500" />
                                                                        Települések és Szavazókörök
                                                                    </h3>
                                                                    <button onClick={() => setSelectedOevk(dist)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline transition-colors flex items-center gap-1">
                                                                        <Search className="w-3 h-3" />
                                                                        Összesítő lap nyitása
                                                                    </button>
                                                                </div>
                                                                
                                                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                                                                    {enrichedData.settlements
                                                                        .filter(s => s.leiro.maz === dist.maz && s.leiro.evk_lst.includes(dist.evk))
                                                                        .sort((a,b) => (b.letszam?.indulo || 0) - (a.letszam?.indulo || 0))
                                                                        .map(settlement => (
                                                                            <SettlementRow key={settlement.leiro.taz} settlement={settlement} evk={dist.evk} />
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </Fragment>
                                );
                            })}
                            {districtsWithTraffic.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500 font-bold">
                                        Nincs a keresésnek megfelelő adat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

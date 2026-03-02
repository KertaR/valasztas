import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, FileCheck2, CalendarClock, Loader2 } from 'lucide-react';
import { PROXIES } from '../utils/constants';

const fetchJson = async (baseUrl) => {
    for (const proxy of PROXIES) {
        try {
            const finalUrl = proxy === 'https://corsproxy.io/?' ? proxy + baseUrl : (proxy !== '' ? proxy + encodeURIComponent(baseUrl) : baseUrl);
            const res = await fetch(finalUrl);
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

const generateHistoryDates = () => {
    const dates = [];

    // Kezdődátum: 2026. február 04.
    const startDate = new Date(2026, 1, 4); // A hónapok 0-tól indulnak (1 = február)
    const endDate = new Date(); // Ma

    // Pici optimalizálás: nem megyünk végig a mai nap minden óráján, ha az aktuális dátum túllépi a mait

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');

        dates.push({ verStr: `${month}${day}0900`, label: `${month}.${day}. 09:00` });
        dates.push({ verStr: `${month}${day}1300`, label: `${month}.${day}. 13:00` });
        dates.push({ verStr: `${month}${day}1700`, label: `${month}.${day}. 17:00` });

        // Következő nap
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};

export default function TrendTab({ enrichedData }) {
    const [trendData, setTrendData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });
    const [viewMode, setViewMode] = useState('overall'); // 'overall', 'parties'
    const [partyStatusFilter, setPartyStatusFilter] = useState('all'); // 'all', 'registered', 'requested', 'submitted'

    useEffect(() => {
        let isMounted = true;
        const loadTrends = async () => {
            setIsLoading(true);
            const dateInfos = generateHistoryDates();

            if (isMounted) setLoadProgress({ loaded: 0, total: dateInfos.length });

            // Batch-es párhuzamos letöltés (20 kérés egyszerre max)
            const BATCH_SIZE = 20;
            const allResults = [];
            let loadedCount = 0;

            for (let i = 0; i < dateInfos.length; i += BATCH_SIZE) {
                if (!isMounted) break;
                const batch = dateInfos.slice(i, i + BATCH_SIZE);

                const batchPromises = batch.map(async (info) => {
                    const cacheKey = `nvi_trend_v3_${info.verStr}`;
                    const cached = localStorage.getItem(cacheKey);
                    if (cached) {
                        try { return JSON.parse(cached); } catch (e) { /* ignore */ }
                    }

                    const data = await fetchJson(`https://vtr.valasztas.hu/ogy2026/data/${info.verStr}/ver/EgyeniJeloltek.json`);
                    if (!data || !data.list) return null;

                    const candidates = data.list;
                    const total = candidates.length;
                    const registered = candidates.filter(c => c.allapot === "1" || c.allapot === "5").length;
                    const getPartyStats = (orgId) => {
                        const cands = candidates.filter(c => c.jelolo_szervezetek?.includes(orgId));
                        return {
                            all: cands.length,
                            requested: cands.filter(c => ["16", "12", "14", "0", "23", "1", "5", "2", "4"].includes(c.allapot)).length,
                            submitted: cands.filter(c => ["14", "0", "23", "1", "5", "2", "4"].includes(c.allapot)).length,
                            registered: cands.filter(c => ["1", "5"].includes(c.allapot)).length,
                        };
                    };

                    const fidesz = getPartyStats(1004);
                    const tisza = getPartyStats(1010);
                    const dk = getPartyStats(1001);
                    const mhm = getPartyStats(1002);

                    const result = {
                        name: info.label,
                        total,
                        registered,
                        fidesz_all: fidesz.all, fidesz_requested: fidesz.requested, fidesz_submitted: fidesz.submitted, fidesz_registered: fidesz.registered,
                        tisza_all: tisza.all, tisza_requested: tisza.requested, tisza_submitted: tisza.submitted, tisza_registered: tisza.registered,
                        dk_all: dk.all, dk_requested: dk.requested, dk_submitted: dk.submitted, dk_registered: dk.registered,
                        mhm_all: mhm.all, mhm_requested: mhm.requested, mhm_submitted: mhm.submitted, mhm_registered: mhm.registered,
                    };

                    try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) { }
                    return result;
                });

                const batchResults = await Promise.all(batchPromises);
                allResults.push(...batchResults);

                loadedCount += batch.length;
                if (isMounted) setLoadProgress({ loaded: loadedCount, total: dateInfos.length });
            }

            if (isMounted) {
                setTrendData(allResults.filter(r => r !== null));
                setIsLoading(false);
            }
        };

        if (trendData.length === 0) {
            loadTrends();
        }

        return () => { isMounted = false; };
    }, []);

    const currentStats = trendData.length > 0 ? trendData[trendData.length - 1] : null;

    if (isLoading) {
        const progressPercent = loadProgress.total > 0 ? Math.round((loadProgress.loaded / loadProgress.total) * 100) : 0;
        return (
            <div className="flex flex-col items-center justify-center p-32 gap-6 max-w-7xl mx-auto h-[60vh]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <div className="text-center w-full max-w-sm">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Trendhistorikus Adatok Letöltése</h2>
                    <p className="text-slate-500 font-bold max-w-md mb-4">Az időpont-alapú adatszolgáltatások letöltése folyamatban...</p>
                    {loadProgress.total > 0 && (
                        <div className="w-full">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                                <span>Feldolgozva: {loadProgress.loaded} / {loadProgress.total}</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!currentStats) return null;

    // Custom Tooltip component for better look natively
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 text-sm">
                    <p className="font-black text-slate-800 dark:text-white mb-3 text-center border-b border-slate-100 dark:border-slate-800 pb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 justify-between py-1">
                            <span className="font-semibold" style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-black text-slate-800 dark:text-slate-200">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Idősáv és Trendelemző (Új)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Az adatszolgáltatások (9:00, 13:00, 17:00) visszamenőleges elemzése</p>
                </div>
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setViewMode('overall')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'overall' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Összesített Trendek</button>
                    <button onClick={() => setViewMode('parties')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'parties' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Pártok Versenye</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                        <Users className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                        <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Összes Bejelentett</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800 dark:text-white relative z-10">
                        {currentStats.total.toLocaleString('hu-HU')}
                    </p>
                    <p className="text-sm text-slate-500 mt-1 relative z-10">Minden, az NVI rendszerébe került jelölt</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                        <FileCheck2 className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-lg"><FileCheck2 className="w-5 h-5" /></div>
                        <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nyilvántartásba Véve</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800 dark:text-white relative z-10">
                        {currentStats.registered.toLocaleString('hu-HU')}
                    </p>
                    <p className="text-sm text-slate-500 mt-1 relative z-10">Jogerős (indult) listát állító jelöltek</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                        <CalendarClock className="w-24 h-24 text-amber-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-lg"><CalendarClock className="w-5 h-5" /></div>
                        <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Időpontok Száma</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800 dark:text-white relative z-10 flex items-baseline gap-2">
                        {trendData.length} <span className="text-lg text-slate-400 font-semibold uppercase">mérés</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1 relative z-10">Napi 3 fázisból az elmúlt napokban</p>
                </div>
            </div>

            {viewMode === 'overall' && (
                <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Általános Jelölti Trendek (Feldolgozottság)</h3>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.15} />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={15} angle={-45} textAnchor="end" />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="total" name="Összes Bejelentett" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                                <Area type="monotone" dataKey="registered" name="Nyilvántartásba Vettek" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRegistered)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {viewMode === 'parties' && (
                <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pártok Bejelentkezési Versenye</h3>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={partyStatusFilter}
                                onChange={(e) => setPartyStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="all">Minden bejelentett jelölt</option>
                                <option value="requested">Csak: Ajánlóívet igényelt/átvett</option>
                                <option value="submitted">Csak: Ajánlóívet leadta/Bejelentve</option>
                                <option value="registered">Csak: Nyilvántartásba véve (Jogerős is)</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.15} />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={15} angle={-45} textAnchor="end" />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 'bold' }} />
                                <Line type="monotone" dataKey={`fidesz_${partyStatusFilter}`} name="FIDESZ-KDNP" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey={`tisza_${partyStatusFilter}`} name="TISZA" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey={`dk_${partyStatusFilter}`} name="Demokratikus Koalíció" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey={`mhm_${partyStatusFilter}`} name="Mi Hazánk" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

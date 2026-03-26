import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { TrendingUp, Users, FileCheck2, CalendarClock, Loader2 } from 'lucide-react';
import { PageLayout, ExportButton, ChartErrorBoundary } from '../components/ui';
import { useExportImage } from '../hooks/useExportImage';
import { useDataContext } from '../contexts';

const fetchJson = async (url) => {
    try {
        const res = await fetch(url);
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn('Hiba a trend letöltésnél:', e);
    }
    return null;
};

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

export default function TrendTab() {
    const { enrichedData } = useDataContext();
    const trendRef = useRef(null);
    const { exportImage, isExporting } = useExportImage(trendRef, 'trend_elemzes');
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
                    const cacheKey = `nvi_trend_v6_${info.verStr}`;
                    const cached = localStorage.getItem(cacheKey);
                    if (cached) {
                        try { return JSON.parse(cached); } catch (e) { /* ignore */ }
                    }

                    const data = await fetchJson(`/api/nvi/${info.verStr}/ver/EgyeniJeloltek.json`);
                    if (!data || !data.list) return null;

                    const candidates = data.list;
                    const total_submitted = candidates.filter(c => ["14", "0", "23"].includes(c.allapot)).length;
                    const registered = candidates.filter(c => ["1", "5"].includes(c.allapot)).length;
                    const total_rejected = candidates.filter(c => ["2", "4"].includes(c.allapot)).length;
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
                        total_submitted,
                        registered,
                        total_rejected,
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
            <div className="flex flex-col items-center justify-center p-8 md:p-32 gap-8 max-w-7xl mx-auto h-[70vh]">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-full shadow-xl border border-slate-200 dark:border-slate-800">
                        <TrendingUp className="w-12 h-12 text-blue-500" />
                    </div>
                </div>

                <div className="text-center w-full max-w-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Trendhistorikus Adatok Letöltése</h2>
                    <p className="text-sm text-slate-500 font-medium mb-6">Időpont-alapú adatszolgáltatások elemzése...</p>
                    {loadProgress.total > 0 && (
                        <div className="w-full">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                <span className="uppercase tracking-wider">Feldolgozva: {loadProgress.loaded} / {loadProgress.total}</span>
                                <span className="text-blue-500">{progressPercent}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 bg-[length:200%_auto] animate-gradient"
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

    const firstStats = trendData.length > 0 ? trendData[0] : null;
    if (!firstStats) return null;

    const diffTotal = currentStats.total_submitted - firstStats.total_submitted;
    const diffRegistered = currentStats.registered - firstStats.registered;

    // Kiszámoljuk az utolsó 2 adatpont közötti párt-különbséget a gyorselemzéshez
    const previousStats = trendData.length > 1 ? trendData[trendData.length - 2] : firstStats;
    const insights = [];
    if (previousStats && currentStats) {
        const tiszaDiff = currentStats.tisza_all - previousStats.tisza_all;
        const fideszDiff = currentStats.fidesz_all - previousStats.fidesz_all;
        const dkDiff = currentStats.dk_all - previousStats.dk_all;
        const mhmDiff = currentStats.mhm_all - previousStats.mhm_all;

        if (tiszaDiff > 0) insights.push(`TISZA: +${tiszaDiff}`);
        if (fideszDiff > 0) insights.push(`FIDESZ-KDNP: +${fideszDiff}`);
        if (dkDiff > 0) insights.push(`DK: +${dkDiff}`);
        if (mhmDiff > 0) insights.push(`Mi Hazánk: +${mhmDiff}`);
        if (insights.length === 0) insights.push('Nincs érdemi növekedés a legutóbbi adatponthoz képest.');
    }

    // Custom Tooltip component for better look natively
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 dark:border-slate-700/50 min-w-[200px]">
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">{label}</p>
                    <div className="space-y-2.5">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{entry.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <PageLayout
            title="Idősáv és Trendelemző"
            subtitle="Adatszolgáltatások dinamikus visszamenőleges elemzése"
            icon={TrendingUp}
            actions={<ExportButton onClick={exportImage} isExporting={isExporting} />}
            contentRef={trendRef}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                        <Users className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></div>
                            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bejelentett Jelöltek</h3>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                            {(currentStats.total_submitted ?? 0).toLocaleString('hu-HU')}
                        </p>
                        {diffTotal !== 0 && (
                            <span className={`flex items-center text-sm font-bold px-2 py-1 rounded-lg ${diffTotal > 0 ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-100 dark:bg-rose-500/10'}`}>
                                {diffTotal > 0 ? '+' : ''}{diffTotal}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                        <FileCheck2 className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-xl"><FileCheck2 className="w-5 h-5" /></div>
                            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nyilvántartásba Véve</h3>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                            {currentStats.registered.toLocaleString('hu-HU')}
                        </p>
                        {diffRegistered !== 0 && (
                            <span className={`flex items-center text-sm font-bold px-2 py-1 rounded-lg ${diffRegistered > 0 ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-100 dark:bg-rose-500/10'}`}>
                                {diffRegistered > 0 ? '+' : ''}{diffRegistered}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                        <CalendarClock className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl"><CalendarClock className="w-5 h-5" /></div>
                            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mérések Száma</h3>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                            {trendData.length}
                        </p>
                        <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Adatpont</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="hidden md:block bg-blue-50/50 dark:bg-blue-500/5 border-b border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Legutóbbi növekedés: {insights.join(" | ")}
                    </p>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">Dinamikus Elemző Grafikon</h3>
                            <p className="text-sm text-slate-500 font-medium">Válts a különböző nézetek és szűrők között</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                                <button onClick={() => setViewMode('overall')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'overall' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Összesített</button>
                                <button onClick={() => setViewMode('parties')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'parties' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Pártok Versenye</button>
                            </div>

                            {viewMode === 'parties' && (
                                <select
                                    value={partyStatusFilter}
                                    onChange={(e) => setPartyStatusFilter(e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                                >
                                    <option value="all">Minden bejelentett</option>
                                    <option value="requested">Csak: Ívet igényelt/átvett</option>
                                    <option value="submitted">Csak: Leadta/Bejelentve</option>
                                    <option value="registered">Csak: Nyilvántartásba véve</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="h-[450px] w-full">
                        <ChartErrorBoundary>
                            <ResponsiveContainer width="100%" height="100%">
                                {viewMode === 'overall' ? (
                                    <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} tickMargin={15} angle={-45} textAnchor="end" />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} tickMargin={10} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Legend iconType="circle" verticalAlign="top" height={48} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                        <Area type="monotone" dataKey="total_submitted" name="Bejelentett" stroke="#3b82f6" strokeWidth={3} fill="url(#colorSubmitted)" activeDot={{ r: 7, strokeWidth: 0, fill: '#3b82f6' }} />
                                        <Area type="monotone" dataKey="registered" name="Nyilvántartásba Véve" stroke="#10b981" strokeWidth={3} fill="url(#colorRegistered)" activeDot={{ r: 7, strokeWidth: 0, fill: '#10b981' }} />
                                        <Area type="monotone" dataKey="total_rejected" name="Nyilvántartásból Elutasítva" stroke="#ef4444" strokeWidth={3} fill="url(#colorRejected)" activeDot={{ r: 7, strokeWidth: 0, fill: '#ef4444' }} />
                                    </AreaChart>
                                ) : (
                                    <LineChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} tickMargin={15} angle={-45} textAnchor="end" />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} tickMargin={10} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Legend iconType="circle" verticalAlign="top" height={48} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                        <Line type="monotone" dataKey={`fidesz_${partyStatusFilter}`} name="FIDESZ-KDNP" stroke="#f97316" strokeWidth={4} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#f97316' }} />
                                        <Line type="monotone" dataKey={`tisza_${partyStatusFilter}`} name="TISZA" stroke="#06b6d4" strokeWidth={4} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#06b6d4' }} />
                                        <Line type="monotone" dataKey={`dk_${partyStatusFilter}`} name="Demokratikus Koalíció" stroke="#3b82f6" strokeWidth={4} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} />
                                        <Line type="monotone" dataKey={`mhm_${partyStatusFilter}`} name="Mi Hazánk" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </ChartErrorBoundary>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, UserPlus, FileEdit, Building2, CheckCircle2, ChevronRight, Filter, ArrowRightLeft } from 'lucide-react';

export default function ChangelogTab({ enrichedData, setSelectedCandidate, setSelectedOrg }) {
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'status', 'new_cand', 'new_org'

    // Szűrések a mai napi eltérések alapján - a "allCandidates"-ből dolgozunk, hogy a kiesettek/töröltek változásai is benne legyenek
    const newCandidates = enrichedData.allCandidates ? enrichedData.allCandidates.filter(c => c.isNew) : enrichedData.candidates.filter(c => c.isNew);
    const changedCandidates = enrichedData.allCandidates ? enrichedData.allCandidates.filter(c => c.hasStatusChanged) : enrichedData.candidates.filter(c => c.hasStatusChanged);
    const newOrgs = enrichedData.organizations.filter(o => o.isNew);

    const totalChanges = newCandidates.length + changedCandidates.length + newOrgs.length;

    const mergedFeed = useMemo(() => {
        const feed = [
            ...changedCandidates.map(c => ({ type: 'status', data: c, sortName: c.neve })),
            ...newCandidates.map(c => ({ type: 'new_cand', data: c, sortName: c.neve })),
            ...newOrgs.map(o => ({ type: 'new_org', data: o, sortName: o.nev }))
        ];

        // Egyelőre név szerinti ABC-be rendezzük a Feed-et
        feed.sort((a, b) => a.sortName.localeCompare(b.sortName, 'hu'));

        if (filterBy !== 'all') {
            return feed.filter(item => item.type === filterBy);
        }

        return feed;
    }, [newCandidates, changedCandidates, newOrgs, filterBy]);

    const renderFeedItem = (item, idx) => {
        if (item.type === 'status') {
            const c = item.data;
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`status-${c.szj || c.ej_id}-${idx}`}
                    onClick={() => setSelectedCandidate(c)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group flex items-start gap-4"
                >
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileEdit className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                                    {c.neve}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">{c.maz}-{c.evk} OEVK &bull; {c.districtName}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-sm mt-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="line-through text-slate-500 dark:text-slate-400 truncate">{c.oldStatusName}</span>
                            <ArrowRightLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 hidden sm:block flex-shrink-0" />
                            <span className="font-bold text-amber-600 dark:text-amber-400 w-fit truncate">
                                {c.statusName}
                            </span>
                        </div>
                    </div>
                </motion.div>
            );
        }

        if (item.type === 'new_cand') {
            const c = item.data;
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`newcand-${c.szj || c.ej_id}-${idx}`}
                    onClick={() => setSelectedCandidate(c)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group flex items-start gap-4"
                >
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                    {c.neve}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Új jelölt rögzítve &bull; {c.maz}-{c.evk} OEVK</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{c.districtName}</span>
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50">{c.partyNames}</span>
                            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md font-bold">{c.statusName}</span>
                        </div>
                    </div>
                </motion.div>
            );
        }

        if (item.type === 'new_org') {
            const o = item.data;
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`neworg-${o.szkod}-${idx}`}
                    onClick={() => setSelectedOrg(o)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group flex items-start gap-4"
                >
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                    {o.nev}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Új szervezet rögzítve</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            {o.r_nev && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{o.r_nev}</span>}
                            <span className="uppercase text-[10px] tracking-wider font-black">Szervezet ID: {o.szkod}</span>
                        </div>
                    </div>
                </motion.div>
            );
        }
        return null;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-4xl mx-auto transition-colors pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 transition-colors">
                        <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Napi Változások Naplója
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">
                        A Választás.hu friss adatainak összehasonlítása az előző nap rögzített állapottal.
                    </p>
                </div>
                {totalChanges > 0 && (
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black rounded-lg text-sm border border-blue-100 dark:border-blue-800/50 shadow-sm shrink-0">
                        {totalChanges} új esemény
                    </div>
                )}
            </div>

            {totalChanges === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors mt-8">
                    <CheckCircle2 className="w-20 h-20 text-emerald-400 dark:text-emerald-500/50 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Nincsenek új változások</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        A jelenleg letöltött adatok teljesen megegyeznek a tegnapi adatközléssel. Sem új jelölteket nem vettek nyilvántartásba, sem a meglévők állapota nem módosult.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full mt-4">
                    {/* Szűrők */}
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-4 z-10 w-fit">
                        <div className="p-2 text-slate-400 border-r border-slate-200 dark:border-slate-700 hidden sm:block">
                            <Filter className="w-4 h-4" />
                        </div>
                        <button onClick={() => setFilterBy('all')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterBy === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            Minden esemény
                        </button>
                        <button onClick={() => setFilterBy('status')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterBy === 'status' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}>
                            Státuszváltozások ({changedCandidates.length})
                        </button>
                        <button onClick={() => setFilterBy('new_cand')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterBy === 'new_cand' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                            Új jelöltek ({newCandidates.length})
                        </button>
                        <button onClick={() => setFilterBy('new_org')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterBy === 'new_org' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}>
                            Új szervezetek ({newOrgs.length})
                        </button>
                    </div>

                    {/* Teljesítményre optimalizált (nem túl hosszú) lista */}
                    <div className="flex flex-col gap-3">
                        <AnimatePresence>
                            {mergedFeed.length > 0 ? (
                                mergedFeed.slice(0, 200).map((item, idx) => renderFeedItem(item, idx))
                            ) : (
                                <div className="text-center py-10 text-slate-500">Ebben a kategóriában jelenleg nincs friss változás.</div>
                            )}
                        </AnimatePresence>
                        {mergedFeed.length > 200 && (
                            <div className="text-center p-4 text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                További {mergedFeed.length - 200} esemény elrejtve a gyors megjelenítés érdekében...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

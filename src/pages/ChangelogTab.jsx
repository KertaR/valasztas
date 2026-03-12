import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, UserPlus, FileEdit, Building2, CheckCircle2, ChevronRight, ChevronLeft, Filter, ArrowRightLeft } from 'lucide-react';
import { useUIContext, useDataContext } from '../contexts';

const ITEMS_PER_PAGE = 20;

export default function ChangelogTab() {
    const { enrichedData } = useDataContext();
    const { setSelectedCandidate, setSelectedOrg } = useUIContext();
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'status', 'new_cand', 'new_org'
    const [currentPage, setCurrentPage] = useState(1);

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

        feed.sort((a, b) => a.sortName.localeCompare(b.sortName, 'hu'));

        if (filterBy !== 'all') {
            return feed.filter(item => item.type === filterBy);
        }

        return feed;
    }, [newCandidates, changedCandidates, newOrgs, filterBy]);

    // Szűrő váltásakor visszaállítjuk az 1. oldalra
    const handleFilterChange = (f) => { setFilterBy(f); setCurrentPage(1); };

    const totalPages = Math.max(1, Math.ceil(mergedFeed.length / ITEMS_PER_PAGE));
    const paginatedFeed = mergedFeed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                    className="p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-400/50 dark:hover:border-amber-600/50 transition-all cursor-pointer group flex items-start gap-5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="p-3.5 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/40 dark:to-amber-900/10 text-amber-500 rounded-xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm border border-amber-200/50 dark:border-amber-800/30">
                        <FileEdit className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                                    {c.neve}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">{c.maz}-{c.evk} OEVK &bull; {c.districtName}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mt-4 bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-700/30 w-full md:w-fit backdrop-blur-sm">
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
                    className="p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-400/50 dark:hover:border-emerald-600/50 transition-all cursor-pointer group flex items-start gap-5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-900/10 text-emerald-500 rounded-xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm border border-emerald-200/50 dark:border-emerald-800/30">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                    {c.neve}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Új jelölt rögzítve &bull; {c.maz}-{c.evk} OEVK</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">
                            <span className="bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200/30 dark:border-slate-700/30 shadow-sm">{c.districtName}</span>
                            <span className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/40 dark:to-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm">{c.partyNames}</span>
                            <span className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {c.statusName}
                            </span>
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
                    className="p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all cursor-pointer group flex items-start gap-5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/40 dark:to-indigo-900/10 text-indigo-500 rounded-xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm border border-indigo-200/50 dark:border-indigo-800/30">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                    {o.nev}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Új szervezet rögzítve</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">
                            {o.r_nev && <span className="bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg font-bold text-slate-600 dark:text-slate-300 border border-slate-200/30 dark:border-slate-700/30 shadow-sm">{o.r_nev}</span>}
                            <span className="uppercase text-[10px] tracking-wider font-black px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">Szervezet ID: {o.szkod}</span>
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
                <div className="flex flex-col gap-8 w-full mt-4">
                    {/* Interaktív Kártyás Szűrők */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <button 
                            onClick={() => handleFilterChange('all')} 
                            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${filterBy === 'all' ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-lg scale-105 z-10' : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'}`}
                        >
                            <span className={`text-2xl font-black mb-1 ${filterBy === 'all' ? '' : 'text-slate-800 dark:text-slate-200'}`}>
                                {totalChanges}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Minden Esemeny</span>
                        </button>
                        
                        <button 
                            onClick={() => handleFilterChange('status')} 
                            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${filterBy === 'status' ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105 z-10' : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-amber-50/80 dark:hover:bg-amber-900/20 hover:border-amber-300/50 dark:hover:border-amber-700/50 hover:shadow-md hover:text-amber-700 dark:hover:text-amber-400'}`}
                        >
                            <span className={`text-2xl font-black mb-1 ${filterBy === 'status' ? '' : 'text-amber-600 dark:text-amber-500'}`}>
                                {changedCandidates.length}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Státusz Változás</span>
                        </button>

                        <button 
                            onClick={() => handleFilterChange('new_cand')} 
                            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${filterBy === 'new_cand' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105 z-10' : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 hover:border-emerald-300/50 dark:hover:border-emerald-700/50 hover:shadow-md hover:text-emerald-700 dark:hover:text-emerald-400'}`}
                        >
                            <span className={`text-2xl font-black mb-1 ${filterBy === 'new_cand' ? '' : 'text-emerald-600 dark:text-emerald-500'}`}>
                                {newCandidates.length}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Új Jelöltek</span>
                        </button>

                        <button 
                            onClick={() => handleFilterChange('new_org')} 
                            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${filterBy === 'new_org' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105 z-10' : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/20 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 hover:shadow-md hover:text-indigo-700 dark:hover:text-indigo-400'}`}
                        >
                            <span className={`text-2xl font-black mb-1 ${filterBy === 'new_org' ? '' : 'text-indigo-600 dark:text-indigo-500'}`}>
                                {newOrgs.length}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Új Szervezetek</span>
                        </button>
                    </div>

                    {/* Változások Listája */}
                    <div className="flex flex-col gap-3">
                        <AnimatePresence mode="popLayout">
                            {paginatedFeed.length > 0 ? (
                                paginatedFeed.map((item, idx) => renderFeedItem(item, idx))
                            ) : (
                                <div className="text-center py-16 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Ebben a kategóriában jelenleg nincs friss változás.</p>
                                </div>
                            )}
                        </AnimatePresence>
                        
                        {/* Pagináció (Lapozó) */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Összesen: <span className="font-bold text-slate-800 dark:text-white">{mergedFeed.length}</span> esemény
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-1 px-2">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const p = i + 1;
                                            // Egyszerűsített lapozó, ha nagyon sok oldal lenne, elrejtjük a középsőket
                                            if (totalPages > 7) {
                                                if (p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
                                                    if (p === 2 || p === totalPages - 1) return <span key={p} className="text-slate-400 px-1">...</span>;
                                                    return null;
                                                }
                                            }
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

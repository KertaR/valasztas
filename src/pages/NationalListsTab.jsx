import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Search, Users, Target, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import { getImageUrl } from '../utils/helpers';

export default function NationalListsTab({ enrichedData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('progress'); // 'progress' | 'official'

    // 1. Hivatalos Listák adatai
    const officialListsData = useMemo(() => {
        if (!enrichedData || !enrichedData.organizations) return [];
        return enrichedData.organizations
            .filter(org => org.nationalListCandidates && org.nationalListCandidates.length > 0)
            .map(org => ({
                ...org,
                name: org.r_nev || org.nev || 'Ismeretlen párt'
            }))
            .sort((a, b) => b.nationalListCandidates.length - a.nationalListCandidates.length);
    }, [enrichedData]);

    // 2. Haladás (Prognózis) kalkuláció (most már useEnrichedData-ból jön)
    const formationsProgress = enrichedData.formationsProgress || [];

    // Keresés mindkét nézeten
    const filteredOfficial = officialListsData.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.nev && org.nev.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredProgress = formationsProgress.filter(f =>
        f.abbr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Fejléc és Kereső */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800">
                        <List className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Országos Listák</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {activeView === 'progress'
                                ? 'A pártok és pártszövetségek haladása az országos listaállításhoz.'
                                : 'A hivatalosan bejelentett országos listák és a rajtuk szereplő indulók.'}
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Keresés..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Tab Kapcsoló */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full max-w-md mx-auto md:mx-0 border border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveView('progress')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeView === 'progress'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <Target className="w-4 h-4" />
                    Haladás / Prognózis
                </button>
                <button
                    onClick={() => setActiveView('official')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeView === 'official'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <List className="w-4 h-4" />
                    Hivatalos Listák
                </button>
            </div>

            {/* Tartalom */}
            <AnimatePresence mode="wait">
                {activeView === 'progress' ? (
                    <motion.div
                        key="progress"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                    >
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-4 rounded-xl flex items-start gap-4 shadow-sm">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Listaállítási szabályok:</strong> Országos pártlistát az a párt (vagy pártszövetség) állíthat, amely legalább <strong>14 vármegyében és a fővárosban</strong>, összesen legalább <strong>71 egyéni választókerületben</strong> önálló vagy közös jelöltet állított.
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredProgress.map(f => {
                                const oevkRegPercent = Math.min(100, (f.regOevkCount / 71) * 100);
                                const oevkTotPercent = Math.min(100, (f.totalOevkCount / 71) * 100);

                                const countyRegPercent = Math.min(100, (f.regCountyCount / 15) * 100);
                                const countyTotPercent = Math.min(100, (f.totalCountyCount / 15) * 100);

                                return (
                                    <motion.div
                                        key={f.key}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
                                    >
                                        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex-1">
                                            <div className="flex justify-between items-start mb-4 gap-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight">
                                                        {f.abbr}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-2" title={f.fullName}>
                                                        {f.fullName}
                                                    </p>
                                                </div>
                                                {f.isSure ? (
                                                    <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                ) : f.isPossible ? (
                                                    <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                                                        <AlertCircle className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 shrink-0">
                                                        <XCircle className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border max-w-full">
                                                {f.isSure ? (
                                                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
                                                        Biztosan állíthat listát
                                                    </span>
                                                ) : f.isPossible ? (
                                                    <span className="text-amber-700 dark:text-amber-400 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5"></span>
                                                        Esélyes a listaállításra
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600 dark:text-slate-400 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                                                        <span className="w-2 h-2 rounded-full bg-slate-400 inline-block mr-1.5"></span>
                                                        Egyelőre nincs esély
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">OEVK Jelöltek</span>
                                                        <span className="text-sm font-black text-slate-800 dark:text-white">
                                                            {f.regOevkCount} <span className="text-slate-400 dark:text-slate-500 font-bold text-xs">/ 71</span>
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                                        <div className="absolute top-0 left-0 h-full bg-blue-200 dark:bg-blue-900/50" style={{ width: `${oevkTotPercent}%` }}></div>
                                                        <div className={`absolute top-0 left-0 h-full ${f.isSure ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'} transition-all duration-500`} style={{ width: `${oevkRegPercent}%` }}></div>
                                                    </div>
                                                    {f.pendingOevkCount > 0 && (
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                            + {f.pendingOevkCount} folyamatban
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Vármegyék (min. 14 + Bp)</span>
                                                        <span className="text-sm font-black text-slate-800 dark:text-white">
                                                            {f.regCountyCount} <span className="text-slate-400 dark:text-slate-500 font-bold text-xs">/ 15</span>
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                                        <div className="absolute top-0 left-0 h-full bg-purple-200 dark:bg-purple-900/50" style={{ width: `${countyTotPercent}%` }}></div>
                                                        <div className={`absolute top-0 left-0 h-full ${f.isSure ? 'bg-emerald-500' : 'bg-purple-600 dark:bg-purple-500'} transition-all duration-500`} style={{ width: `${countyRegPercent}%` }}></div>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1.5 pt-1">
                                                        {f.hasCapital ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        ) : f.pendingHasCapital ? (
                                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                        ) : (
                                                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                                        )}
                                                        <span className={`text-[10px] font-bold ${f.hasCapital ? 'text-emerald-700 dark:text-emerald-400' : f.pendingHasCapital ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            Budapest {f.hasCapital ? 'megvan' : f.pendingHasCapital ? 'folyamatban' : 'hiányzik'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {filteredProgress.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    Nincs a keresésnek megfelelő formáció.
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="official"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOfficial.map(org => {
                                return (
                                    <motion.div
                                        key={org.szkod}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[600px]"
                                    >
                                        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/40">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-start justify-between gap-2">
                                                <span className="line-clamp-2 leading-tight">{org.name}</span>
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium line-clamp-1" title={org.nev}>
                                                {org.nev}
                                            </p>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80">
                                                    Lista: {org.nationalListStatus}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {org.nationalListCandidates.length} fő
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800">
                                            <div className="flex flex-col gap-2">
                                                {org.nationalListCandidates.map((cand) => (
                                                    <div key={cand.tj_id || cand.kpn_id || cand.neve} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-2 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {cand.sorsz}.
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={cand.neve}>
                                                                {cand.neve}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                                {cand.statusName}
                                                            </div>
                                                        </div>
                                                        {cand.fenykep && (
                                                            <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-200 dark:bg-slate-800">
                                                                <img src={getImageUrl(cand.fenykep)} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {officialListsData.length === 0 && !searchTerm && (
                                <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-5 text-slate-400 border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <List className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Még nem töltöttek fel országos listákat</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                        Amint a pártok hivatalosan is bejelentik az országos listáikat, azok itt fognak megjelenni. Addig kövesd a Haladás / Prognózis fület!
                                    </p>
                                </div>
                            )}

                            {officialListsData.length > 0 && filteredOfficial.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    Nincs a keresésnek megfelelő pártlista.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Search, Users, CheckCircle2, AlertCircle, XCircle, Info, X, ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Map, MapPin, Check } from 'lucide-react';
import { getImageUrl } from '../utils/helpers';

const COUNTY_MAP = {
    "01": "Budapest",
    "02": "Baranya",
    "03": "Bács-Kiskun",
    "04": "Békés",
    "05": "Borsod-Abaúj-Zemplén",
    "06": "Csongrád-Csanád",
    "07": "Fejér",
    "08": "Győr-Moson-Sopron",
    "09": "Hajdú-Bihar",
    "10": "Heves",
    "11": "Komárom-Esztergom",
    "12": "Nógrád",
    "13": "Pest",
    "14": "Somogy",
    "15": "Szabolcs-Szatmár-B.",
    "16": "Jász-Nagykun-Sz.",
    "17": "Tolna",
    "18": "Vas",
    "19": "Veszprém",
    "20": "Zala"
};

export default function NationalListsTab({ enrichedData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormation, setSelectedFormation] = useState(null); // Modal state
    const [expandedCounties, setExpandedCounties] = useState({});

    const toggleCounties = (key) => setExpandedCounties(prev => ({ ...prev, [key]: !prev[key] }));

    // Formations with official lists injected
    const listsData = useMemo(() => {
        if (!enrichedData || !enrichedData.formationsProgress || !enrichedData.organizations) return [];

        return enrichedData.formationsProgress.map(f => {
            let officialCandidates = null;
            let officialStatus = null;

            // Check if any of the base organizations in this formation have an official list registered
            for (let szkod of f.szkods) {
                const org = enrichedData.organizations.find(o => o.szkod === szkod);
                if (org && org.nationalListCandidates && org.nationalListCandidates.length > 0) {
                    officialCandidates = org.nationalListCandidates;
                    officialStatus = org.nationalListStatus;
                    break;
                }
            }
            return { ...f, officialCandidates, officialStatus };
        }).sort((a, b) => {
            // Priority 1: Has official list
            if (a.officialCandidates && !b.officialCandidates) return -1;
            if (!a.officialCandidates && b.officialCandidates) return 1;

            // Priority 2: Is Sure to get it
            if (a.isSure && !b.isSure) return -1;
            if (!a.isSure && b.isSure) return 1;

            // Priority 3: Is Possible
            if (a.isPossible && !b.isPossible) return -1;
            if (!a.isPossible && b.isPossible) return 1;

            // Priority 4: Total OEVK count
            return b.totalOevkCount - a.totalOevkCount;
        });
    }, [enrichedData]);

    const filteredData = listsData.filter(f =>
        f.abbr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (selectedFormation) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedFormation]);

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
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-xl">
                            A pártok és pártszövetségek haladása az országos listaállításhoz, és a hivatalosan bejelentett listák.
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72 mt-2 md:mt-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Formáció keresése..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Szabályzat Infó */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-4 rounded-xl flex items-start flex-col sm:flex-row gap-4 shadow-sm">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 hidden sm:block" />
                <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    <div className="flex items-center gap-2 mb-1 sm:hidden">
                        <Info className="w-4 h-4 text-blue-500" />
                        <strong className="text-blue-900 dark:text-blue-200">Listaállítási szabályok</strong>
                    </div>
                    Országos pártlistát az a párt (vagy pártszövetség) állíthat, amely legalább <strong>14 vármegyében és a fővárosban</strong>, összesen legalább <strong>71 egyéni választókerületben</strong> induló jelöltet állított.
                </div>
            </div>

            {/* Kártyák Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {filteredData.map(f => {
                    const hasOfficial = !!f.officialCandidates;

                    const oevkRegPercent = Math.min(100, (f.regOevkCount / 71) * 100);
                    const countyRegPercent = Math.min(100, (f.regCountyCount / 15) * 100);

                    return (
                        <motion.div
                            key={f.key}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-colors relative ${hasOfficial
                                ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-indigo-100 dark:shadow-indigo-900/10'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {/* Díszítő csík hivatalos lista esetén */}
                            {hasOfficial && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>}

                            <div className="p-5 flex-1 flex flex-col">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-5 gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white truncate" title={f.abbr}>
                                            {f.abbr}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate" title={f.fullName}>
                                            {f.fullName}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {hasOfficial ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Hivatalos Lista</span>
                                            </div>
                                        ) : f.isSure ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Jogosult</span>
                                            </div>
                                        ) : f.isPossible ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Küzd</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <XCircle className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Nincs esély</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Haladás bár */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                <Users className="w-3 h-3" />
                                                <span>OEVK (Min 71)</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-white">
                                                {f.regOevkCount} <span className="text-slate-400 text-xs">/ 71</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${f.regOevkCount >= 71 ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-500`} style={{ width: `${oevkRegPercent}%` }}></div>
                                        </div>
                                        {!hasOfficial && f.pendingOevkCount > 0 && (
                                            <div className="mt-1.5 text-[10px] text-slate-500 font-medium">+{f.pendingOevkCount} folyamatban</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <button
                                            onClick={() => toggleCounties(f.key)}
                                            className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-purple-500/50 relative"
                                        >
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                    <Map className="w-3 h-3" />
                                                    <span>Megye (14 + Bp)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-slate-800 dark:text-white">
                                                        {f.regCountyCount} <span className="text-slate-400 text-xs">/ 15</span>
                                                    </span>
                                                    {expandedCounties[f.key] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full ${f.regCountyCount >= 15 && f.hasCapital ? 'bg-emerald-500' : 'bg-purple-500'} transition-all duration-500`} style={{ width: `${countyRegPercent}%` }}></div>
                                            </div>
                                            <div className="mt-1.5 flex justify-between items-center">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className={`w-3 h-3 ${f.hasCapital ? 'text-emerald-500' : 'text-slate-400'}`} />
                                                    <span className={`text-[9px] font-bold uppercase ${f.hasCapital ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>Budapest</span>
                                                </div>
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {expandedCounties[f.key] && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    className="overflow-hidden bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800"
                                                >
                                                    <div className="p-3 max-h-40 overflow-y-auto custom-scrollbar">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {Array.from({ length: 20 }, (_, i) => {
                                                                const maz = (i + 1).toString().padStart(2, '0');
                                                                const isReg = f.registeredCounties?.has(maz);
                                                                const isPend = !isReg && f.pendingCounties?.has(maz);

                                                                if (!isReg && !isPend) {
                                                                    return (
                                                                        <div key={maz} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-50 flex items-center gap-1">
                                                                            <X className="w-2.5 h-2.5" />
                                                                            {COUNTY_MAP[maz]}
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div key={maz} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${isReg
                                                                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                                            : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                        }`}>
                                                                        {isReg ? <Check className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5 mr-0.5 animate-pulse" />}
                                                                        {COUNTY_MAP[maz]}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Szekció ha Hivatalos Lista is elérhető */}
                                {hasOfficial && (
                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Top Jelöltek a listán</div>
                                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Összesen: {f.officialCandidates.length} fő</div>
                                        </div>

                                        <div className="flex flex-col gap-2 mb-4">
                                            {f.officialCandidates.slice(0, 3).map(cand => (
                                                <div key={cand.tj_id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg p-2 border border-slate-100 dark:border-slate-800/50">
                                                    <div className="w-6 text-center text-xs font-black text-slate-400">{cand.sorsz}.</div>
                                                    <div className="w-8 h-8 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                                                        {cand.fenykep ? (
                                                            <img src={getImageUrl(cand.fenykep)} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Users className="w-4 h-4" /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-slate-800 dark:text-white truncate" title={cand.neve}>{cand.neve}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {f.officialCandidates.length > 3 && (
                                            <button
                                                onClick={() => setSelectedFormation(f)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-bold text-sm border border-indigo-100 dark:border-indigo-800/50"
                                            >
                                                <span>A teljes lista megtekintése (+{f.officialCandidates.length - 3} fő)</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {filteredData.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        Nincs a keresésnek megfelelő formáció.
                    </div>
                )}
            </div>

            {/* MODAL a teljes listához */}
            <AnimatePresence>
                {selectedFormation && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
                            onClick={() => setSelectedFormation(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start sticky top-0 z-10">
                                    <div className="pr-8">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Hivatalos Országos Lista</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                            {selectedFormation.abbr}
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{selectedFormation.fullName}</p>
                                    </div>
                                    <button onClick={() => setSelectedFormation(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none shrink-0 border border-transparent">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-950/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Jelöltek listája</div>
                                        <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                                            {selectedFormation.officialCandidates.length} fő
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {selectedFormation.officialCandidates.map((cand) => (
                                            <div key={cand.tj_id || cand.kpn_id || cand.neve} className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-sm flex-shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {cand.sorsz}.
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-base font-bold text-slate-800 dark:text-slate-100 truncate" title={cand.neve}>
                                                        {cand.neve}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                        {cand.statusName}
                                                    </div>
                                                </div>
                                                {cand.fenykep && (
                                                    <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-200 dark:bg-slate-800">
                                                        <img src={getImageUrl(cand.fenykep)} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </motion.div>
    );
}

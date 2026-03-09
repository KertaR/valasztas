import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Map as MapIcon, MapPin, ChevronUp, ChevronDown, Check, X, ShieldCheck, ChevronRight } from 'lucide-react';
import FormationStatusBadge from './FormationStatusBadge';
import CandidateItem from './CandidateItem';

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

const FormationCard = ({ f, searchTerm, onPreviewClick }) => {
    const [isCountiesExpanded, setIsCountiesExpanded] = useState(false);

    const hasOfficial = !!f.officialCandidates;

    let displayCandidates = [];
    if (hasOfficial) {
        const matchingCandidates = searchTerm ? f.officialCandidates.filter(cand =>
            cand.neve.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];

        // Show up to 3 candidates. If there are search matches, prioritize them.
        if (matchingCandidates.length > 0) {
            displayCandidates = matchingCandidates.slice(0, 3);
        } else {
            displayCandidates = f.officialCandidates.slice(0, 3);
        }
    }

    const oevkRegPercent = Math.min(100, (f.regOevkCount / 71) * 100);
    const countyRegPercent = Math.min(100, (f.regCountyCount / 15) * 100);

    return (
        <motion.div
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
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                        <FormationStatusBadge f={f} hasOfficial={hasOfficial} />
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
                            onClick={() => setIsCountiesExpanded(!isCountiesExpanded)}
                            className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-purple-500/50 relative"
                        >
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    <MapIcon className="w-3 h-3" />
                                    <span>Megye (14 + Bp)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-800 dark:text-white">
                                        {f.regCountyCount} <span className="text-slate-400 text-xs">/ 15</span>
                                    </span>
                                    {isCountiesExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
                            {isCountiesExpanded && (
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
                            {displayCandidates.map(cand => {
                                const isMatch = searchTerm && cand.neve.toLowerCase().includes(searchTerm.toLowerCase());
                                return <CandidateItem key={cand.tj_id || cand.kpn_id || cand.neve} cand={cand} isMatch={isMatch} variant="compact" />;
                            })}
                        </div>

                        {f.officialCandidates.length > 3 && (
                            <button
                                onClick={() => onPreviewClick(f)}
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
};

export default FormationCard;

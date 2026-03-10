import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Building2, Map, Users, Target, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { EmptyState } from '../ui';
import OrganizationLogo from './OrganizationLogo';

export default function OrganizationsGrid({ organizations, onSelect }) {
    if (organizations.length === 0) {
        return (
            <EmptyState icon={Building2} text="Nem található jelölő szervezet a megadott feltételekkel." />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {organizations.map((org, idx) => {
                    const progressPercent = Math.min(100, (org.registeredOevkCoverage / 71) * 100);
                    const canStillReachNationalList = org.oevkCoverage >= 71;
                    const hasNationalList = !!org.nationalListStatus;
                    const isListRegistered = org.nationalListStatus?.startsWith('Nyilván');

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            key={org.szkod}
                            onClick={() => onSelect(org)}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                        >
                            {isListRegistered && (
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                            )}
                            {(hasNationalList && !isListRegistered) && (
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
                            )}

                            {/* Header */}
                            <div className="flex items-start gap-4 mb-5">
                                <div className="relative">
                                    <OrganizationLogo
                                        emblema={org.emblema}
                                        nev={org.nev}
                                        r_nev={org.r_nev}
                                    />
                                    {org.isNew && (
                                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900 z-20">
                                            <Zap className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {org.coalitionAbbr || org.r_nev || org.nev}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
                                        {org.coalitionFullName || org.nev}
                                    </p>
                                </div>
                            </div>

                            {/* Coalition Tags */}
                            {org.alliances && org.alliances.length > 0 && !org.isCoalitionMain && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {org.alliances.map((a, i) => (
                                        <span key={i} className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/50">
                                            {a.abbr || 'Szövetség'}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Progress & Stats */}
                            <div className="mt-auto space-y-4">
                                <div>
                                    <div className="flex justify-between items-end mb-1.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            Országos Lista
                                        </span>
                                        {hasNationalList ? (
                                            isListRegistered ? (
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/50">
                                                    <CheckCircle2 className="w-3 h-3" /> Nyilvántartva
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 rounded flex items-center gap-1 border border-blue-200 dark:border-blue-800/50">
                                                    <Target className="w-3 h-3" /> Bejelentve
                                                </span>
                                            )
                                        ) : canStillReachNationalList ? (
                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 rounded flex items-center gap-1 border border-amber-200 dark:border-amber-800/50">
                                                <AlertCircle className="w-3 h-3" /> Küzd
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                                                <XCircle className="w-3 h-3" /> Nincs esély
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                        <div className="absolute top-0 left-0 h-full bg-slate-300 dark:bg-slate-600 transition-all duration-500" style={{ width: `${Math.min(100, (org.oevkCoverage / 71) * 100)}%` }}></div>
                                        <div className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
                                        {/* 71-es vonal */}
                                        <div className="absolute top-0 bottom-0 left-[100%] border-l-2 border-dashed border-red-500 z-10 w-px -ml-px"></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">{org.registeredOevkCoverage} OEVK nyilvántartva</span>
                                        <span className="text-[10px] font-bold text-slate-400">{71} kell</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                                            <Map className="w-3.5 h-3.5" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">OEVK-k</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-700 dark:text-slate-200">{org.oevkCoverage}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Jelöltek</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-700 dark:text-slate-200">{org.candidateCount}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

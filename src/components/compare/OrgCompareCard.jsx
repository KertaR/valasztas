import { Building2, Users, Target, Stamp } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../utils/helpers';

export default function OrgCompareCard({ org }) {
    if (!org) {
        return (
            <div className="h-full min-h-[400px] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center transition-colors">
                <Building2 className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-semibold text-lg">Nincs szervezet kiválasztva</p>
                <p className="text-sm mt-2">Válassz egy pártot az összehasonlításhoz.</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col transition-colors h-full">
            <div className="flex items-center gap-4 mb-8">
                {org.emblema ? (
                    <div className="w-14 h-14 rounded-2xl bg-white flex shrink-0 items-center justify-center p-1.5 shadow-lg shadow-indigo-200 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-colors">
                        <img
                            src={getImageUrl(org.emblema)}
                            alt={org.r_nev || org.nev}
                            crossOrigin="anonymous"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'block';
                            }}
                        />
                        <Building2 className="w-8 h-8 text-indigo-200 dark:text-indigo-400 hidden" />
                    </div>
                ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex shrink-0 items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Building2 className="w-8 h-8" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate transition-colors">{org.coalitionFullName || org.nev}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest transition-colors">{org.coalitionAbbr || org.r_nev || 'Szervezet'}</p>
                        {org.alliances && org.alliances.length > 0 && !org.coalitionFullName && (
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 transition-colors">
                                <Users className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[100px] transition-colors">Partnerek: {org.alliances.slice(0, 1).map(a => a.abbr).join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6 flex-1">
                {/* OEVK Coverage */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter transition-colors">
                        <span className="text-emerald-700 dark:text-emerald-500">Nyilvántartva: {org.registeredOevkCoverage || 0}</span>
                        <span className="text-slate-400 dark:text-slate-500">Összes: {org.oevkCoverage}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50 transition-colors">
                        <div
                            className="absolute h-full bg-indigo-500/30 dark:bg-indigo-500/20 transition-all duration-500"
                            style={{ width: `${org.coveragePercent}%` }}
                        ></div>
                        <div
                            className="absolute h-full bg-emerald-700 dark:bg-emerald-600 shadow-[0_0_8px_rgba(4,120,87,0.4)] transition-all duration-700 delay-200"
                            style={{ width: `${org.registeredCoveragePercent || 0}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-600 transition-colors">
                        <span>{org.registeredCoveragePercent || 0}% Nyilvántartva</span>
                        <span>{org.coveragePercent}% Összes</span>
                    </div>
                </div>

                {/* Candidate Counts */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2 transition-colors">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Összes Jelölt</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white transition-colors">{org.candidateCount}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 transition-colors">
                            <Stamp className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Nyilvántartva</span>
                        </div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">{org.registeredCandidateCount || 0}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

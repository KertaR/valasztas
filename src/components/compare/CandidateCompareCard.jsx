import { UserCircle2, Building2, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge } from '../ui';
import { getInitials, getImageUrl } from '../../utils/helpers';

export default function CandidateCompareCard({ candidate }) {
    if (!candidate) {
        return (
            <div className="h-full min-h-[400px] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center transition-colors">
                <UserCircle2 className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-semibold text-lg">Nincs jelölt kiválasztva</p>
                <p className="text-sm mt-2">Keress egy jelöltre a fenti mezőben.</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-colors h-full flex flex-col">
            <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                <div className="absolute right-4 -bottom-6 opacity-10">
                    <UserCircle2 className="w-32 h-32" />
                </div>
            </div>

            <div className="px-6 relative -mt-12 flex justify-between items-end mb-4 flex-shrink-0">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-xl relative z-10 border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="w-full h-full bg-gradient-to-tr from-blue-100 dark:from-blue-900/40 to-indigo-50 dark:to-indigo-900/40 rounded-full flex items-center justify-center text-3xl font-black text-indigo-700 dark:text-indigo-400 shadow-inner transition-colors overflow-hidden relative">
                        {candidate.fenykep ? (
                            <img
                                src={getImageUrl(candidate.fenykep)}
                                alt={candidate.neve}
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${candidate.fenykep ? 'hidden' : ''}`}>
                            {getInitials(candidate.neve)}
                        </div>
                    </div>
                </div>
                <div className="pb-2">
                    <StatusBadge status={candidate.statusName} />
                </div>
            </div>

            <div className="px-6 pb-6 mt-2 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1 transition-colors">{candidate.neve}</h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 transition-colors">Képviselőjelölt</p>

                {candidate.allapot_valt && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-6 transition-colors">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Frissítve: {new Date(candidate.allapot_valt).toLocaleString('hu-HU')}</span>
                    </div>
                )}

                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 transition-colors">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-0.5 transition-colors">Jelölő Szervezet</p>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate transition-colors">{candidate.partyNames}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400 transition-colors">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 transition-colors">Indulás Helyszíne</p>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight transition-colors">{candidate.districtName}</p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{candidate.countyName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

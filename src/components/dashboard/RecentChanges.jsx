import { Clock, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColor = (statusName = '') => {
    const s = statusName.toLowerCase();
    if (s.includes('nyilvántartásba v') && !s.includes('nem jogerős')) return { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' };
    if (s.includes('nyilvántartásba v')) return { dot: 'bg-green-400', bg: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' };
    if (s.includes('bejelentve') || s.includes('folyamat')) return { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' };
    if (s.includes('kiesett') || s.includes('törölve') || s.includes('elutasítva') || s.includes('visszautasítva')) return { dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' };
    if (s.includes('jogorvoslat')) return { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' };
    return { dot: 'bg-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' };
};

export default function RecentChanges({ recentUpdates, setSelectedCandidate }) {
    const listVariant = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="glass-card rounded-xl p-5 md:p-6 flex-1 flex flex-col transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Legutóbbi Változások
                {recentUpdates.length > 0 && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50">
                        {recentUpdates.length} változás
                    </span>
                )}
            </h3>
            <motion.div variants={listVariant} initial="hidden" animate="show" className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 max-h-[340px] custom-scrollbar">
                {recentUpdates.map((update, idx) => {
                    const { dot, bg } = statusColor(update.statusName);
                    const prevStatus = update.oldStatusName;
                    const hasChange = prevStatus && prevStatus !== update.statusName;
                    return (
                        <motion.div
                            variants={itemVariant}
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 cursor-pointer group transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50 shadow-sm"
                            onClick={() => setSelectedCandidate(update)}
                        >
                            {/* Avatar / státusz dot */}
                            <div className="relative flex-shrink-0 mt-0.5">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
                                    {update.neve?.split(' ').slice(0, 2).map(n => n[0]).join('') || '?'}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${dot}`} />
                            </div>

                            {/* Szöveg */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                        {update.neve}
                                    </p>
                                </div>

                                {/* Státusz változás nyíllal */}
                                {hasChange ? (
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[80px]">{prevStatus}</span>
                                        <TrendingUp className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bg}`}>{update.statusName}</span>
                                    </div>
                                ) : (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bg} inline-block`}>{update.statusName}</span>
                                )}

                                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    {update.allapot_valt ? new Date(update.allapot_valt).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ismeretlen'}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                {recentUpdates.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">Nincsenek friss változások a mai napra.</p>
                )}
            </motion.div>
        </div>
    );
}

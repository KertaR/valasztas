import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ListProgress({ formations = [] }) {
    const listVariant = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 dark:border-slate-800/80 p-5 md:p-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Listaállítási Haladás
            </h3>
            <motion.div variants={listVariant} initial="hidden" animate="show" className="space-y-8">
                {formations
                    .filter(f => f.totalOevkCount > 0)
                    .slice(0, formations.filter(f => f.isSure).length + 1)
                    .map(f => {
                        const oevkProgress = Math.min(100, (f.regOevkCount / 71) * 100);
                        const oevkTotProgress = Math.min(100, (f.totalOevkCount / 71) * 100);
                        const countyProgress = Math.min(100, (f.regCountyCount / 15) * 100);
                        const countyTotProgress = Math.min(100, (f.totalCountyCount / 15) * 100);

                        return (
                            <motion.div variants={itemVariant} key={f.key} className="space-y-2 p-3 -mx-3 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[150px]">{f.fullName}</span>
                                        {f.isSure && <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse shadow-sm shadow-emerald-500/50 uppercase">Biztos</span>}
                                        {!f.isSure && f.isPossible && <span className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black shadow-sm shadow-amber-500/50 uppercase">Esélyes</span>}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Formáció: {f.abbr}</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                        <span className="text-slate-500 dark:text-slate-400">71 OEVK Jelölt (Indult: {f.totalOevkCount})</span>
                                        <span className={f.isSure ? 'text-emerald-500' : 'text-blue-500'}>{f.regOevkCount} / 71</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/30 relative shadow-inner p-0.5">
                                        {/* Background bar for total launched (még nem regisztráltak) */}
                                        <div
                                            className="h-full absolute inset-y-0.5 left-0.5 bg-blue-300 dark:bg-blue-800/50 rounded-full transition-all duration-1000 blur-[1px]"
                                            style={{ width: `calc(${oevkTotProgress}% - 4px)` }}
                                        ></div>
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 relative z-10 ${f.isSure ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-blue-500 shadow-[0_0_5px_#3b82f6]'}`}
                                            style={{ width: `${oevkProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                        <span>14 Vármegye + Budapest</span>
                                        <span className={f.isSure ? 'text-emerald-500' : 'text-purple-500'}>{f.regCountyCount} / 15</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/30 relative shadow-inner p-0.5">
                                        <div
                                            className="h-full absolute inset-y-0.5 left-0.5 bg-purple-300 dark:bg-purple-800/50 rounded-full transition-all duration-1000 blur-[1px]"
                                            style={{ width: `calc(${countyTotProgress}% - 4px)` }}
                                        ></div>
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 relative z-10 ${f.isSure ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-purple-500 shadow-[0_0_5px_#a855f7]'}`}
                                            style={{ width: `${countyProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                }
            </motion.div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 italic leading-tight">
                * A választási törvény szerint országos listát az a párt (vagy pártszövetség) állíthat, amely legalább 14 vármegyében és a fővárosban, összesen legalább 71 egyéni választókerületben indulót ("Bejelentve" vagy újabb státusz) állított.
            </div>
        </div>
    );
}

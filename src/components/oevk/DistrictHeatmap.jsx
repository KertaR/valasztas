import { motion } from 'framer-motion';

export default function DistrictHeatmap({ districts, onSelect }) {
    // Sort districts by ID to make the grid consistent
    const sorted = [...districts].sort((a, b) => {
        if (a.maz !== b.maz) return a.maz.localeCompare(b.maz);
        return a.evk - b.evk;
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">OEVK Intenzitás Térkép</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">106 választókerület vizuális eloszlása a jelöltek száma alapján.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 rounded-sm"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Kevés</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Átlagos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-indigo-700 rounded-sm"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Forró</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-[repeat(21,minmax(0,1fr))] gap-1.5">
                {sorted.map((dist) => {
                    const count = dist.candidateCount || 0;
                    let bgColor = 'bg-blue-100 dark:bg-blue-900/40';
                    let textColor = 'text-blue-800 dark:text-blue-200';

                    if (count >= 8) {
                        bgColor = 'bg-indigo-700';
                        textColor = 'text-white';
                    } else if (count >= 5) {
                        bgColor = 'bg-blue-500';
                        textColor = 'text-white';
                    } else if (count >= 3) {
                        bgColor = 'bg-blue-300 dark:bg-blue-800';
                        textColor = 'text-blue-900 dark:text-blue-100';
                    }

                    return (
                        <motion.button
                            key={`${dist.maz}-${dist.evk}`}
                            whileHover={{ scale: 1.2, zIndex: 20 }}
                            onClick={() => onSelect(dist)}
                            className={`aspect-square ${bgColor} ${textColor} rounded-md flex items-center justify-center text-[10px] font-black shadow-sm transition-colors relative group`}
                            title={`${dist.evk_nev}: ${count} jelölt`}
                        >
                            {count}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30 shadow-xl border border-white/10">
                                {dist.evk_nev}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

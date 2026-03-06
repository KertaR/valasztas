import { motion } from 'framer-motion';
import { PieChart as PieChartIcon } from 'lucide-react';

export default function ParliamentChart({
    parliamentSeats,
    leadingParty,
    leadingStatus,
    leadingColor
}) {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-md border border-slate-200/60 dark:border-slate-800/60 p-8 flex flex-col items-center justify-center relative min-h-[420px] overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

            <div className="absolute top-8 left-8 flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <PieChartIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    Parlamenti Út a 199 Mandátumhoz
                </h3>
            </div>

            <div className="w-full h-[340px] mt-16 relative flex justify-center z-10">
                <svg viewBox="0 0 500 260" className="w-full h-full max-w-[580px] drop-shadow-lg pb-4 pt-2">
                    {parliamentSeats.map((seat, i) => (
                        <motion.circle
                            key={`seat-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.002, duration: 0.3 }}
                            cx={seat.x}
                            cy={seat.y}
                            r={6.5}
                            fill={seat.color || '#e2e8f0'}
                            className="transition-colors duration-500 hover:opacity-75 stroke-white dark:stroke-slate-900 stroke-[1.5px] cursor-pointer"
                        >
                            <title>{seat.party || 'Üres'} Seat</title>
                        </motion.circle>
                    ))}
                </svg>
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none w-full px-2">
                    {leadingParty ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                            <span className="text-[4rem] md:text-[5rem] leading-none font-black drop-shadow-sm" style={{ color: leadingParty.color }}>
                                {leadingParty.value}
                            </span>
                            <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest mt-2 md:mt-3 mb-2 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 rounded-xl backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-800 ${leadingColor} text-center leading-snug max-w-[90%] md:max-w-full`}>
                                {leadingStatus}
                            </span>
                        </motion.div>
                    ) : null}
                </div>
            </div>

            <div className="w-full flex gap-4 md:gap-12 items-end justify-center opacity-90 z-10 relative mt-4">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 md:mb-1.5 text-center">Kormánytöbbség</span>
                    <div className="flex items-baseline gap-1 bg-slate-100 dark:bg-slate-800 px-3 md:px-4 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <span className="text-lg md:text-xl font-black text-slate-700 dark:text-slate-300">100</span>
                        <span className="text-[9px] md:text-xs text-slate-500 font-bold">mand.</span>
                    </div>
                </div>
                <div className="w-px h-10 md:h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-shrink-0"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 md:mb-1.5 text-center">Alkotmányozó 2/3</span>
                    <div className="flex items-baseline gap-1 bg-slate-100 dark:bg-slate-800 px-3 md:px-4 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <span className="text-lg md:text-xl font-black text-slate-700 dark:text-slate-300">133</span>
                        <span className="text-[9px] md:text-xs text-slate-500 font-bold">mand.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

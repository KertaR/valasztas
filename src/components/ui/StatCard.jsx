import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function StatCard({ icon, title, value, color, diff, onClick }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest).toLocaleString('hu-HU'));

    useEffect(() => {
        const animation = animate(count, value, { duration: 1.2, ease: "easeOut" });
        return animation.stop;
    }, [value]);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            onClick={onClick}
            className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-5 flex items-center gap-4 hover:shadow-md transition-all ${onClick ? 'cursor-pointer group' : 'cursor-default'}`}
        >
            {/* Background SVG Sparkline */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                    <path
                        d={
                            diff !== undefined
                                ? (diff > 0
                                    ? "M0,30 Q25,25 50,15 T100,0 L100,30 Z"
                                    : "M0,0 Q25,10 50,20 T100,30 L100,30 L0,30 Z")
                                : "M0,25 Q25,15 50,20 T100,10 L100,30 L0,30 Z"
                        }
                        fill="currentColor"
                        className={diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-blue-500'}
                    />
                    <path
                        d={
                            diff !== undefined
                                ? (diff > 0
                                    ? "M0,30 Q25,25 50,15 T100,0"
                                    : "M0,0 Q25,10 50,20 T100,30")
                                : "M0,25 Q25,15 50,20 T100,10"
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`opacity-50 ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-blue-500'}`}
                    />
                </svg>
            </div>

            <div className={`relative z-10 p-3 md:p-3.5 rounded-2xl ${color} dark:bg-opacity-20 shadow-inner flex-shrink-0 transition-transform ${onClick ? 'group-hover:scale-110' : ''}`}>{icon}</div>
            <div className="min-w-0 relative z-10">
                <p className={`text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5 uppercase tracking-wider truncate ${onClick ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors' : ''}`}>{title}</p>
                <div className="flex items-baseline gap-2">
                    <motion.p className="text-xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{rounded}</motion.p>
                    {diff !== undefined && diff !== null && diff !== 0 && (
                        <span className={`text-xs md:text-sm font-bold ${diff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {diff > 0 ? '+' : ''}{diff}
                        </span>
                    )}
                </div>
                {onClick && (
                    <p className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Kattints a részletekért →
                    </p>
                )}
            </div>
        </motion.div>
    );
}

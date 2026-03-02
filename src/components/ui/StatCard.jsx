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
            className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-5 flex items-center gap-4 hover:shadow-md transition-all ${onClick ? 'cursor-pointer group' : 'cursor-default'}`}
        >
            <div className={`p-3 md:p-3.5 rounded-2xl ${color} dark:bg-opacity-20 shadow-inner flex-shrink-0 transition-transform ${onClick ? 'group-hover:scale-110' : ''}`}>{icon}</div>
            <div className="min-w-0">
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

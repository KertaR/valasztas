import { Activity, ChevronRightCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContestedDistrict({ district, onClick }) {
    if (!district) return null;

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => onClick(district)}
            className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 dark:from-indigo-800 dark:via-indigo-900 dark:to-indigo-950 rounded-3xl shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] border border-indigo-400/30 p-5 md:p-6 text-white relative overflow-hidden cursor-pointer group"
        >
            {/* Animated background glow pulse */}
            <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 p-4"
            >
                <Activity className="w-24 h-24" />
            </motion.div>
            <div className="relative z-10">
                <h3 className="text-indigo-100 font-semibold uppercase tracking-wider text-xs mb-2">Legkiélezettebb Választókerület</h3>
                <p className="font-bold text-xl leading-tight mb-4 pr-6">{district.evk_nev}</p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-inner">
                        <span className="text-3xl font-black drop-shadow-md">{district.candidateCount}</span>
                        <span className="text-[10px] ml-2 font-black uppercase opacity-90 tracking-widest">Jelölt</span>
                    </div>
                    <ChevronRightCircle className="w-7 h-7 text-white/50 group-hover:text-white transition-colors drop-shadow-sm group-hover:translate-x-1 duration-300" />
                </div>
            </div>
        </motion.div>
    );
}

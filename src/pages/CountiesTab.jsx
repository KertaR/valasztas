import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Counties Components
import { CountyChart, CountyTable } from '../components';

export default function CountiesTab({ enrichedData, setSelectedCountyDetail }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-6xl mx-auto transition-colors">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white transition-colors">Vármegyei Összesítések</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">Adatok és statisztikák megyei szintre aggregálva.</p>
                </div>
                <div className="hidden sm:flex bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 items-center gap-3 transition-colors">
                    <Info className="w-6 h-6 flex-shrink-0" />
                    <p className="text-xs font-semibold leading-tight max-w-[200px]">A táblázat mutatja a kerületek (OEVK) számát és az ott indulókat.</p>
                </div>
            </div>

            <CountyChart data={enrichedData.countiesData} onSelect={setSelectedCountyDetail} />
            <CountyTable data={enrichedData.countiesData} onSelect={setSelectedCountyDetail} />
        </motion.div>
    );
}
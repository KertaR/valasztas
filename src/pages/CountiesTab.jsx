import { useState, useRef } from 'react';
import { Info, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';

// Counties Components
import { CountyChart, CountyTable } from '../components';
import { useUIContext, useDataContext } from '../contexts';

export default function CountiesTab() {
    const { enrichedData } = useDataContext();
    const { setSelectedCountyDetail, setSelectedOevk } = useUIContext();
    const countiesRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const exportImage = async () => {
        if (!countiesRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(countiesRef.current, {
                cacheBust: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `varmegyei_osszesito_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Image export failed:', err);
            alert('Hiba történt a kép generálása közben.');
        } finally {
            setIsExporting(false);
        }
    };
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-6xl mx-auto transition-colors">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white transition-colors">Vármegyei Összesítések</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">Adatok és statisztikák megyei szintre aggregálva.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="hidden sm:flex bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 items-center gap-3 transition-colors">
                        <Info className="w-6 h-6 flex-shrink-0" />
                        <p className="text-xs font-semibold leading-tight max-w-[200px]">A táblázat mutatja a kerületek (OEVK) számát és az ott indulókat.</p>
                    </div>
                    <button
                        onClick={exportImage}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300 hover:bg-slate-700 dark:hover:bg-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isExporting ? 'Mentés...' : 'Exportálás'}</span>
                    </button>
                </div>
            </div>

            <div ref={countiesRef} className="space-y-6 pt-2 pb-4 px-2 -mx-2 sm:mx-0 sm:px-0 rounded-3xl sm:bg-transparent">

                <CountyChart data={enrichedData.countiesData} onSelect={setSelectedCountyDetail} />
                <CountyTable data={enrichedData.countiesData} enrichedData={enrichedData} onSelectOevk={setSelectedOevk} />
            </div>
        </motion.div>
    );
}
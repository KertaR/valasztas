import { useRef, useState } from 'react';
import { X, Users, Map, Download, Loader2, MapPin, UsersRound, Building2, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

export default function CountyModal({ selectedCounty, enrichedData, onClose, onSelectOevk }) {
    const modalRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    if (!selectedCounty) return null;

    // Filter districts belonging to this county
    const countyOevks = enrichedData.districts.filter(d => d.maz === selectedCounty.id);

    // Calculate party distribution in this county
    const partyStats = {};
    let independentCount = 0;

    enrichedData.candidates.forEach(c => {
        if (c.maz === selectedCounty.id) {
            if (c.partyNames === 'Független') {
                independentCount++;
            } else {
                partyStats[c.partyNames] = (partyStats[c.partyNames] || 0) + 1;
            }
        }
    });

    const sortedParties = Object.entries(partyStats)
        .map(([name, count]) => ({ name, count, isParty: true }))
        .sort((a, b) => b.count - a.count);

    // Merge them but with a flag, or handle separately in UI
    const distributionData = [...sortedParties];
    if (independentCount > 0) {
        distributionData.push({ name: 'Független jelöltek (Összesen)', count: independentCount, isParty: false });
    }

    const exportImage = async () => {
        if (!modalRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(modalRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `valasztas_varmegye_${selectedCounty.nev.toLowerCase().replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
            alert('Hiba történt az exportálás közben.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header Controls */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button onClick={exportImage} disabled={isExporting} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all shadow-sm">
                            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        </button>
                        <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all shadow-sm">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar" ref={modalRef}>
                        {/* Hero Section */}
                        <div className="h-40 bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-600 p-8 flex items-end relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MapPin className="w-48 h-48 -rotate-12 translate-x-12 translate-y-12" />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                                    <MapPin className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">{selectedCounty.nev}</h2>
                                    <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs">Vármegyei Statisztika</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Választókerületek</p>
                                    <div className="flex items-center gap-2">
                                        <Map className="w-5 h-5 text-indigo-500" />
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">{selectedCounty.oevkCount}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Összes Választó</p>
                                    <div className="flex items-center gap-2">
                                        <UsersRound className="w-5 h-5 text-blue-500" />
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">{selectedCounty.voterCount.toLocaleString('hu-HU')}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Összes Jelölt</p>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-emerald-500" />
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">{selectedCounty.candidateCount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Party Distribution */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <PieChart className="w-4 h-4" />
                                    Jelöltek megoszlása szervezetenként
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-3">
                                        {distributionData.slice(0, 7).map((item, idx) => {
                                            const totalActiveInCounty = distributionData.reduce((acc, curr) => acc + curr.count, 0);
                                            const percent = Math.round((item.count / totalActiveInCounty) * 100);
                                            return (
                                                <div key={item.name} className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className={`${item.isParty ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 font-black'} truncate max-w-[250px] uppercase tracking-tight`}>
                                                            {item.name}
                                                        </span>
                                                        <span className="text-slate-500 dark:text-slate-400">{item.count} jelölt ({percent}%)</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percent}%` }}
                                                            transition={{ duration: 1, delay: idx * 0.1 }}
                                                            className={`h-full ${!item.isParty ? 'bg-slate-400 dark:bg-slate-500' : (idx === 0 ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-indigo-400')}`}
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {distributionData.length > 7 && (
                                            <p className="text-[10px] text-slate-400 font-bold italic pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                                                + további {distributionData.length - 7} szervezet jelöltjei
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Map className="w-4 h-4" />
                                    Választókerületek a vármegyében
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {countyOevks.map(oevk => (
                                        <div
                                            key={`${oevk.maz}-${oevk.evk}`}
                                            onClick={() => { onSelectOevk(oevk); onClose(); }}
                                            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer group transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">{oevk.maz_nev} {oevk.evk}.</span>
                                                <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{oevk.candidateCount} jelölt</span>
                                            </div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{oevk.evk_nev}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

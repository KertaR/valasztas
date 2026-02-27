import { useRef, useState } from 'react';
import { X, Target, Users, UserCircle2, Building2, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../ui';
import { toPng } from 'html-to-image';
import { getInitials, getImageUrl } from '../../utils/helpers';

export default function OrgModal({ selectedOrg, enrichedData, onClose }) {
    const cardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    if (!selectedOrg) return null;

    const exportImage = async () => {
        if (!cardRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 3
            });
            const link = document.createElement('a');
            link.download = `szervezet_adatlap_${selectedOrg.r_nev || selectedOrg.nev.substring(0, 10)}.png`;
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
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Záró Gomb (Kívül az export zónán) */}
                    <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-slate-900/10 dark:bg-slate-100/10 hover:bg-slate-900/20 dark:hover:bg-slate-100/20 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>

                    {/* Exportálható Fejléc Zóna */}
                    <div ref={cardRef} className="px-5 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex flex-col flex-shrink-0 bg-gradient-to-br from-indigo-50 dark:from-indigo-900/60 to-blue-50 dark:to-blue-900/60 relative overflow-hidden transition-colors">
                        <Building2 className="absolute -right-4 -top-4 w-32 h-32 text-indigo-200 dark:text-indigo-400 opacity-60 dark:opacity-20 transition-colors" />

                        <div className="relative z-10 w-full mb-4 flex gap-4 md:gap-6 items-start">
                            {selectedOrg.emblema && (
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white shadow-md border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center p-2 mt-1 transition-colors">
                                    <img
                                        src={getImageUrl(selectedOrg.emblema)}
                                        alt={selectedOrg.r_nev || selectedOrg.nev}
                                        crossOrigin="anonymous"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-3"><span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm transition-colors">Jelölő Szervezet</span></div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight pr-6 sm:pr-12 transition-colors">{selectedOrg.coalitionFullName || selectedOrg.nev}</h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1.5 text-lg transition-colors">Rövidítés: {selectedOrg.coalitionAbbr || selectedOrg.r_nev}</p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-2 flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur w-fit p-3 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm transition-colors">
                            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">Országos lefedettség: </span>
                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 transition-colors">{selectedOrg.oevkCoverage} / 106 OEVK ({selectedOrg.coveragePercent}%)</span>
                        </div>
                    </div>

                    <div className="p-0 sm:p-6 overflow-y-auto flex-1 bg-white sm:bg-slate-50/50 dark:bg-slate-900 sm:dark:bg-slate-900/50 transition-colors">
                        <div className="p-4 sm:p-0 flex flex-col sm:flex-row items-center justify-between mb-0 sm:mb-4 border-b sm:border-b-0 border-slate-100 dark:border-slate-800 gap-4 transition-colors">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg transition-colors"><Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Szervezet jelöltjei ({selectedOrg.candidateCount} fő)</h3>
                            <button
                                onClick={exportImage}
                                disabled={isExporting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-75 disabled:cursor-wait"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {isExporting ? 'Kép készítése...' : 'Kép Mentése a Fejlécről'}
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-800 sm:rounded-xl overflow-hidden shadow-none sm:shadow-sm transition-colors">
                            <table className="w-full text-left border-collapse transition-colors">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm transition-colors">
                                    <tr>
                                        <th className="p-3 sm:p-4 font-semibold">Jelölt neve</th>
                                        <th className="p-3 sm:p-4 font-semibold hidden md:table-cell">Választókerület</th>
                                        <th className="p-3 sm:p-4 font-semibold">Státusz</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                    {enrichedData.candidates
                                        .filter(c => {
                                            if (selectedOrg.szkod === 0) return !c.jelolo_szervezetek || c.jelolo_szervezetek.length === 0;

                                            const targetIds = [selectedOrg.szkod, ...(selectedOrg.coalitionPartnerIds || [])];
                                            return c.jelolo_szervezetek && c.jelolo_szervezetek.some(id => targetIds.includes(id));
                                        })
                                        .sort((a, b) => a.neve.localeCompare(b.neve))
                                        .map((jelolt, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                                <td className="p-3 sm:p-4">
                                                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm border border-blue-200 dark:border-blue-800 flex-shrink-0 transition-colors relative">
                                                            {jelolt.fenykep ? (
                                                                <img
                                                                    src={getImageUrl(jelolt.fenykep)}
                                                                    alt={jelolt.neve}
                                                                    crossOrigin="anonymous"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextElementSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={`w-full h-full flex items-center justify-center ${jelolt.fenykep ? 'hidden' : ''}`}>
                                                                {getInitials(jelolt.neve)}
                                                            </div>
                                                        </div>
                                                        {jelolt.neve}
                                                    </div>
                                                    <div className="md:hidden mt-1 text-xs text-slate-500 dark:text-slate-400 leading-tight transition-colors">{jelolt.countyName} <br /> {jelolt.districtName}</div>
                                                </td>
                                                <td className="p-3 sm:p-4 text-sm hidden md:table-cell">
                                                    <div className="font-medium text-slate-700 dark:text-slate-300 transition-colors">{jelolt.countyName}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{jelolt.districtName}</div>
                                                </td>
                                                <td className="p-3 sm:p-4"><StatusBadge status={jelolt.statusName} /></td>
                                            </tr>
                                        ))}
                                    {selectedOrg.candidateCount === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-slate-500 dark:text-slate-400">Nincs rögzített jelölt ennél a szervezetnél.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

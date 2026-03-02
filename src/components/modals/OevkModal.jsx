import { useRef, useState, useMemo, useEffect } from 'react';
import { X, Users, Map, Download, Loader2, TrendingUp, Shield, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../ui';
import { toPng } from 'html-to-image';
import { getInitials, getImageUrl } from '../../utils/helpers';

// Pártszín térkép
const PARTY_COLORS = {
    'FIDESZ-KDNP': '#f97316',
    'TISZA': '#06b6d4',
    'FIDESZ': '#f97316',
    'DK': '#3b82f6',
    'MI HAZÁNK': '#10b981',
    'MKKP': '#8b5cf6',
    'JOBBIK': '#a16207',
    'MSZP': '#dc2626',
    'LMP': '#16a34a',
    'MOMENTUM': '#7c3aed',
};

const getPartyColor = (partyName) => {
    const upper = (partyName || '').toUpperCase();
    for (const [key, color] of Object.entries(PARTY_COLORS)) {
        if (upper.includes(key)) return color;
    }
    // Hash alapú szín az ismeretlen pártokhoz
    let hash = 0;
    for (let i = 0; i < upper.length; i++) hash = upper.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 45%)`;
};

export default function OevkModal({ selectedOevk, enrichedData, onClose }) {
    const cardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // *** Minden hook UNCONDITIONALLY, early return ELŐTT ***
    const districtCandidates = useMemo(() => {
        if (!selectedOevk) return [];
        return enrichedData.candidates
            .filter(c => c.maz === selectedOevk.maz && c.evk === selectedOevk.evk)
            .sort((a, b) => {
                const aReg = a.statusName.startsWith('Nyilvántartásba') ? 0 : 1;
                const bReg = b.statusName.startsWith('Nyilvántartásba') ? 0 : 1;
                if (aReg !== bReg) return aReg - bReg;
                return a.neve.localeCompare(b.neve, 'hu');
            });
    }, [enrichedData.candidates, selectedOevk]);

    if (!selectedOevk) return null;

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
            link.download = `oevk_adatlap_${selectedOevk.maz}_${selectedOevk.evk}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Image export failed:', err);
            alert('Hiba történt a kép generálása közben.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Választás '26 - ${selectedOevk.evk_nev}`,
            text: `📍 ${selectedOevk.evk_nev}\nSzékhely: ${selectedOevk.szekhely}\nVálasztópolgárok: ${selectedOevk.letszam?.indulo?.toLocaleString('hu-HU')} fő\nInduló jelöltek: ${districtCandidates.length} fő.\n\nNézd meg a részleteket a Választás '26 appban:`,
            url: window.location.href, // Or a specific deep link if routing is configured
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy fallback:', err);
            }
        }
    };

    const registeredCount = districtCandidates.filter(c => c.statusName.startsWith('Nyilvántartásba')).length;
    const totalCount = districtCandidates.length;

    // Kompetitivitás jelző
    let competitiveness = null;
    if (registeredCount >= 4) competitiveness = { label: 'Kiemelt verseny', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' };
    else if (registeredCount >= 3) competitiveness = { label: 'Versenyképes', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' };
    else if (registeredCount >= 2) competitiveness = { label: 'Kétszereplős', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' };
    else if (registeredCount === 1) competitiveness = { label: 'Egyedüli jelölt', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' };
    else competitiveness = { label: 'Még nincs jelölt', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };

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
                    {/* Záró Gomb */}
                    <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-slate-900/10 dark:bg-slate-100/10 hover:bg-slate-900/20 dark:hover:bg-slate-100/20 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>

                    {/* Exportálható Fejléc */}
                    <div ref={cardRef} className="px-5 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex flex-col bg-gradient-to-br from-blue-50 dark:from-blue-900/60 to-emerald-50 dark:to-emerald-900/60 relative overflow-hidden transition-colors">
                        <Map className="absolute -right-4 -top-4 w-32 h-32 text-blue-200 dark:text-blue-400 opacity-50 dark:opacity-20 transition-colors" />
                        <div className="relative z-10 w-full mb-5">
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="bg-blue-600 dark:bg-blue-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm tracking-widest transition-colors">{selectedOevk.maz}-{selectedOevk.evk}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hidden sm:inline transition-colors">Választókerület Részletek</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight pr-12 transition-colors">{selectedOevk.evk_nev}</h2>

                            <div className="mt-4 flex flex-wrap gap-3 items-center">
                                <div className="bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg px-4 py-2 border border-white/50 dark:border-slate-700/50 shadow-sm leading-none flex gap-2 items-center transition-colors">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">Székhely: </span> {selectedOevk.szekhely}
                                </div>
                                <div className="bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm font-black rounded-lg px-4 py-2 border border-white/50 dark:border-slate-700/50 shadow-sm leading-none flex gap-2 items-center transition-colors">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">Választók: </span>
                                    <span className="text-blue-700 dark:text-blue-400 transition-colors">{selectedOevk.letszam?.indulo?.toLocaleString('hu-HU')} fő</span>
                                </div>
                                {/* Kompetitivitás badge */}
                                {competitiveness && (
                                    <div className={`flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 border shadow-sm transition-colors ${competitiveness.bg}`}>
                                        <TrendingUp className={`w-4 h-4 ${competitiveness.color}`} />
                                        <span className={competitiveness.color}>{competitiveness.label}</span>
                                        <span className={`text-xs font-black ml-1 ${competitiveness.color}`}>{registeredCount} nyilvántartott jelölt</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pártszín bár */}
                        {districtCandidates.length > 0 && (
                            <div className="relative z-10 flex flex-wrap gap-2">
                                {districtCandidates.map((c, i) => {
                                    const color = getPartyColor(c.partyNames);
                                    const isReg = c.statusName.startsWith('Nyilvántartásba');
                                    return (
                                        <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[11px] font-bold shadow-sm ${!isReg ? 'opacity-40' : ''}`}
                                            style={{ backgroundColor: color }} title={`${c.neve} – ${c.partyNames}`}>
                                            <div className="w-4 h-4 rounded-full bg-white/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-[8px] font-black">
                                                {c.fenykep
                                                    ? <img src={getImageUrl(c.fenykep)} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                                    : getInitials(c.neve)
                                                }
                                            </div>
                                            <span className="max-w-[80px] truncate">{c.partyNames}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Jelöltek lista fejléce */}
                    <div className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 gap-3 bg-white dark:bg-slate-900 flex-shrink-0">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg transition-colors">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors" />
                            Induló jelöltek ({totalCount} fő)
                            {registeredCount > 0 && (
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> {registeredCount} nyilvántartva
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
                                title="Megosztás"
                            >
                                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                                <span>{isCopied ? 'Másolva!' : 'Megosztás'}</span>
                            </button>
                            <button
                                onClick={exportImage}
                                disabled={isExporting}
                                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-75 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {isExporting ? 'Készül...' : 'Képként mentés az adatokról'}
                            </button>
                        </div>
                    </div>

                    {/* Jelöltek táblázat */}
                    <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-900 transition-colors">
                        <table className="w-full text-left border-collapse transition-colors">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm transition-colors sticky top-0">
                                <tr>
                                    <th className="p-3 sm:p-4 font-semibold">Jelölt neve</th>
                                    <th className="p-3 sm:p-4 font-semibold hidden md:table-cell">Jelölő Szervezet</th>
                                    <th className="p-3 sm:p-4 font-semibold">Státusz</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                {districtCandidates.map((jelolt, idx) => {
                                    const partyColor = getPartyColor(jelolt.partyNames);
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                            <td className="p-3 sm:p-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                                    {/* Pártszín csík */}
                                                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: partyColor }} />
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm border-2 flex-shrink-0 transition-colors relative"
                                                        style={{ borderColor: partyColor + '40', backgroundColor: partyColor + '15', color: partyColor }}>
                                                        {jelolt.fenykep ? (
                                                            <img src={getImageUrl(jelolt.fenykep)} alt={jelolt.neve} crossOrigin="anonymous" className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                                                        ) : null}
                                                        <div className={`w-full h-full flex items-center justify-center ${jelolt.fenykep ? 'hidden' : ''}`}>{getInitials(jelolt.neve)}</div>
                                                    </div>
                                                    {jelolt.neve}
                                                </div>
                                                <div className="md:hidden mt-1 ml-5 text-xs font-semibold truncate max-w-[200px] transition-colors" style={{ color: partyColor }}>{jelolt.partyNames}</div>
                                            </td>
                                            <td className="p-3 sm:p-4 hidden md:table-cell">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                                                    style={{ backgroundColor: partyColor }}>
                                                    {jelolt.partyNames}
                                                </span>
                                            </td>
                                            <td className="p-3 sm:p-4"><StatusBadge status={jelolt.statusName} /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

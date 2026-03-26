import { useRef, useState, useMemo, useEffect } from 'react';
import { Users, Map, Download, Loader2, TrendingUp, Shield, Share2, Check, Building } from 'lucide-react';
import { StatusBadge, Modal } from '../ui';
import { PollingStationsViewer } from '../oevk';
import { getInitials, getImageUrl } from '../../utils/helpers';
import { useUIContext, useDataContext } from '../../contexts';
import { useExportImage, useShare } from '../../hooks';

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

export default function OevkModal() {
    const { selectedOevk, setSelectedOevk } = useUIContext();
    const { enrichedData } = useDataContext();
    const onClose = () => setSelectedOevk(null);
    const cardRef = useRef(null);
    const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' or 'stations'

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

    const { exportImage, isExporting } = useExportImage(cardRef, selectedOevk ? `oevk_adatlap_${selectedOevk.maz}_${selectedOevk.evk}` : 'oevk_adatlap');
    const { handleShare, isCopied } = useShare({
        title: selectedOevk ? `Választás '26 - ${selectedOevk.evk_nev}` : '',
        text: selectedOevk ? `📍 ${selectedOevk.evk_nev}\nSzékhely: ${selectedOevk.szekhely}\nVálasztópolgárok: ${selectedOevk.letszam?.indulo?.toLocaleString('hu-HU')} fő\nInduló jelöltek: ${districtCandidates.length} fő.\n\nNézd meg a részleteket a Választás '26 appban:` : '',
        url: window.location.href, // Or a specific deep link if routing is configured
    });

    if (!selectedOevk) return null;

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
        <Modal onClose={onClose} maxWidthClass="max-w-4xl">

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

            {/* Tartalom Tabs vezérlővel */}
            <div className="p-2 sm:px-6 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 gap-3 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('candidates')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'candidates' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Users className="w-4 h-4" />
                        Jelöltek
                    </button>
                    <button
                        onClick={() => setActiveTab('stations')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'stations' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Building className="w-4 h-4" />
                        Szavazókörök
                    </button>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                        onClick={handleShare}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
                        title="Megosztás"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isCopied ? 'Másolva!' : 'Megosztás'}</span>
                    </button>
                    <button
                        onClick={exportImage}
                        disabled={isExporting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-3 py-2 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-75 disabled:cursor-wait"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isExporting ? 'Készül...' : 'Mentés'}</span>
                    </button>
                </div>
            </div>

            {/* Dinamikus Tartalom */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-colors h-[400px] sm:h-auto">
                {activeTab === 'candidates' ? (
                    <div className="overflow-y-auto w-full h-full pb-4">
                        {districtCandidates.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 font-bold flex flex-col items-center justify-center h-full">
                                <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                                Még nincsenek feltöltött jelöltek ebben a választókerületben.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse transition-colors">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm transition-colors sticky top-0 z-10">
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
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col overflow-hidden">
                        <PollingStationsViewer selectedOevk={selectedOevk} settlements={enrichedData.settlements} />
                    </div>
                )}
            </div>
        </Modal>
    );
}

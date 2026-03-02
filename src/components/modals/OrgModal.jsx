import { useRef, useState, useMemo } from 'react';
import { X, Target, Users, Building2, Download, Loader2, Search, Filter, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../ui';
import { toPng } from 'html-to-image';
import { getInitials, getImageUrl } from '../../utils/helpers';

const STATUS_GROUPS = [
    { key: 'all', label: 'Összes' },
    { key: 'registered', label: 'Nyilvántartva', match: s => s.startsWith('Nyilvántartásba véve') },
    { key: 'pending', label: 'Folyamatban', match: s => !s.startsWith('Nyilvántartásba') && !s.toLowerCase().includes('törölve') && !s.toLowerCase().includes('elutasítva') && !s.toLowerCase().includes('kiesett') && !s.toLowerCase().includes('visszalépett') && !s.toLowerCase().includes('nem kíván') && !s.toLowerCase().includes('visszautasítva') },
    { key: 'rejected', label: 'Elutasítva/Törölve', match: s => s.toLowerCase().includes('törölve') || s.toLowerCase().includes('elutasítva') || s.toLowerCase().includes('kiesett') || s.toLowerCase().includes('visszalépett') || s.toLowerCase().includes('visszautasítva') || s.toLowerCase().includes('nem kíván') },
];

export default function OrgModal({ selectedOrg, enrichedData, onClose }) {
    const cardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'county' | 'status'

    // *** Minden hook UNCONDITIONALLY, early return ELŐTT ***
    const allOrgCandidates = useMemo(() => {
        if (!selectedOrg) return [];
        return enrichedData.candidates
            .filter(c => {
                if (selectedOrg.szkod === 0) return !c.jelolo_szervezetek || c.jelolo_szervezetek.length === 0;
                const targetIds = [selectedOrg.szkod, ...(selectedOrg.coalitionPartnerIds || [])];
                return c.jelolo_szervezetek && c.jelolo_szervezetek.some(id => targetIds.includes(id));
            });
    }, [enrichedData.candidates, selectedOrg]);

    const statusGroupCounts = useMemo(() => {
        const counts = { all: allOrgCandidates.length };
        STATUS_GROUPS.slice(1).forEach(g => {
            counts[g.key] = allOrgCandidates.filter(c => g.match(c.statusName)).length;
        });
        return counts;
    }, [allOrgCandidates]);

    const filteredCandidates = useMemo(() => {
        let list = [...allOrgCandidates];
        const group = STATUS_GROUPS.find(g => g.key === statusFilter);
        if (group && group.match) {
            list = list.filter(c => group.match(c.statusName));
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(c => c.neve.toLowerCase().includes(q) || c.districtName.toLowerCase().includes(q) || c.countyName.toLowerCase().includes(q));
        }
        list.sort((a, b) => {
            if (sortBy === 'county') return (a.countyName + a.districtName).localeCompare(b.countyName + b.districtName, 'hu');
            if (sortBy === 'status') return a.statusName.localeCompare(b.statusName, 'hu');
            return a.neve.localeCompare(b.neve, 'hu');
        });
        return list;
    }, [allOrgCandidates, statusFilter, searchTerm, sortBy]);

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

    const handleShare = async () => {
        const shareData = {
            title: `Választás '26 - ${selectedOrg.coalitionAbbr || selectedOrg.r_nev || selectedOrg.nev}`,
            text: `🏛️ ${selectedOrg.coalitionFullName || selectedOrg.nev}\nLefedettség: ${selectedOrg.oevkCoverage}/106 OEVK (${selectedOrg.coveragePercent}%)\nÖsszes jelölt: ${selectedOrg.candidateCount} fő\n\nNézd meg a részleteket a Választás '26 appban:`,
            url: window.location.href, // Or a specific deep link
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

                        <div className="relative z-10 mt-2 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur w-fit p-3 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm transition-colors">
                                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">Lefedettség: </span>
                                <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 transition-colors">{selectedOrg.oevkCoverage} / 106 OEVK ({selectedOrg.coveragePercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur w-fit p-3 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm transition-colors">
                                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">{selectedOrg.candidateCount} jelölt</span>
                                {statusGroupCounts.registered > 0 && (
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                        {statusGroupCounts.registered} nyilvántartva
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Szűrő és Keresés sáv */}
                    <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 flex-shrink-0">
                        {/* Státusz szűrő gombok */}
                        <div className="flex flex-wrap gap-2">
                            {STATUS_GROUPS.map(g => (
                                <button
                                    key={g.key}
                                    onClick={() => setStatusFilter(g.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === g.key
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {g.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${statusFilter === g.key ? 'bg-white/30' : 'bg-white dark:bg-slate-700 text-slate-500'}`}>
                                        {statusGroupCounts[g.key] ?? allOrgCandidates.length}
                                    </span>
                                </button>
                            ))}
                            <div className="ml-auto flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="name">Rendezés: Név</option>
                                    <option value="county">Rendezés: Megye</option>
                                    <option value="status">Rendezés: Státusz</option>
                                </select>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm">
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none"
                                        title="Megosztás"
                                    >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                                        <span className="hidden sm:inline">{isCopied ? 'Másolva' : 'Megosztás'}</span>
                                    </button>
                                    <button onClick={exportImage} disabled={isExporting}
                                        className="flex items-center gap-1.5 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-75 disabled:cursor-wait"
                                    >
                                        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                        <span className="hidden sm:inline">Képként mentés</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Keresőmező */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Jelölt neve, kerület vagy megye..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white placeholder-slate-400"
                            />
                        </div>
                    </div>

                    {/* Jelöltek listája */}
                    <div className="overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                        {filteredCandidates.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                                <Filter className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="font-semibold">Nincs a feltételeknek megfelelő jelölt.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse transition-colors">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm transition-colors sticky top-0">
                                    <tr>
                                        <th className="p-3 sm:p-4 font-semibold">Jelölt neve</th>
                                        <th className="p-3 sm:p-4 font-semibold hidden md:table-cell">Választókerület</th>
                                        <th className="p-3 sm:p-4 font-semibold">Státusz</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors bg-white dark:bg-slate-900">
                                    {filteredCandidates.map((jelolt, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                            <td className="p-3 sm:p-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm border border-blue-200 dark:border-blue-800 flex-shrink-0 transition-colors relative">
                                                        {jelolt.fenykep ? (
                                                            <img src={getImageUrl(jelolt.fenykep)} alt={jelolt.neve} crossOrigin="anonymous" className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                                                        ) : null}
                                                        <div className={`w-full h-full flex items-center justify-center ${jelolt.fenykep ? 'hidden' : ''}`}>{getInitials(jelolt.neve)}</div>
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
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-400 dark:text-slate-600 font-semibold text-right">
                        {filteredCandidates.length} jelölt megjelenítve
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

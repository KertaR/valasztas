import { useRef, useState } from 'react';
import { X, MapPin, Building2, Download, Loader2, UserCircle2, Stamp, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../ui';
import { toPng } from 'html-to-image';
import { getInitials, getImageUrl } from '../../utils/helpers';
import { useUIContext } from '../../contexts';

export default function CandidateModal() {
    const { selectedCandidate: candidate, setSelectedCandidate } = useUIContext();
    const onClose = () => setSelectedCandidate(null);
    const cardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    if (!candidate) return null;

    const exportImage = async () => {
        if (!cardRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 3 // High-Quality for social media
            });
            const link = document.createElement('a');
            link.download = `jelolt_adatlap_${candidate.neve.replace(/\s+/g, '_').toLowerCase()}.png`;
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
            title: `${candidate.neve} - Vál. '26`,
            text: `Nézd meg ${candidate.neve} (${candidate.partyNames}) adatlapját a ${candidate.countyName} ${candidate.districtName} választókerületben!`,
            url: window.location.href, // Esetleg ha van paraméteres routing: window.location.origin + '?jelolt=' + candidate.szemely_azonosito
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Megosztás megszakítva', err);
            }
        } else {
            // Fallback vágólapra másolás
            try {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                alert('Sikertelen másolás a vágólapra.');
            }
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative transition-colors"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Záró Gomb (kívül marad az exportált képen) */}
                    <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-slate-900/10 dark:bg-slate-100/10 hover:bg-slate-900/20 dark:hover:bg-slate-100/20 backdrop-blur-md rounded-full text-white dark:text-slate-100 transition-all">
                        <X className="w-5 h-5" />
                    </button>

                    {/* Exportálható Névjegykártya Zóna */}
                    <div ref={cardRef} className="relative bg-white dark:bg-slate-900 overflow-hidden pb-8 transition-colors">
                        {/* Háttér fejléc */}
                        <div className="h-32 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 relative">
                            {/* Dekoratív mintázat */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                            {/* Logo/Badge a háttérben */}
                            <div className="absolute right-6 -bottom-8 opacity-5">
                                <UserCircle2 className="w-48 h-48" />
                            </div>
                        </div>

                        {/* Profil Avatar */}
                        <div className="px-8 relative -mt-16 flex justify-between items-end mb-4">
                            <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full p-2 shadow-xl relative z-10 border border-slate-100 dark:border-slate-800 flex-shrink-0 transition-colors">
                                <div className="w-full h-full bg-gradient-to-tr from-blue-100 dark:from-blue-900/40 to-indigo-50 dark:to-indigo-900/40 rounded-full flex items-center justify-center text-4xl font-black text-indigo-700 dark:text-indigo-400 shadow-inner overflow-hidden relative">
                                    {candidate.fenykep ? (
                                        <img
                                            src={getImageUrl(candidate.fenykep)}
                                            alt={candidate.neve}
                                            crossOrigin="anonymous"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center ${candidate.fenykep ? 'hidden' : ''}`}>
                                        {getInitials(candidate.neve)}
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md">
                                    <div className={`w-4 h-4 rounded-full ${candidate.statusName.includes('Nyilvántartásba') ? 'bg-emerald-500' : candidate.statusName.includes('Törölve') || candidate.statusName.includes('Elutasítva') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                </div>
                            </div>

                            <div className="pb-4 transform translate-y-2">
                                <StatusBadge status={candidate.statusName} />
                            </div>
                        </div>

                        {/* Fő Adatok */}
                        <div className="px-8 mt-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2 transition-colors">{candidate.neve}</h2>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-8 transition-colors">Országgyűlési Képviselőjelölt 2026</p>

                            <div className="space-y-4">
                                {/* Szervezet Kártya */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 transition-colors">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-0.5 transition-colors">Jelölő Szervezet</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate transition-colors">{candidate.partyNames}</p>
                                    </div>
                                </div>

                                {/* Választókerület Kártya */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600"></div>
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400 transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 transition-colors">Indulás Helyszíne (OEVK)</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-tight transition-colors">
                                            {candidate.districtName}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{candidate.countyName}</p>
                                    </div>
                                </div>

                                {/* Állapot Frissítés (Időbélyegző) */}
                                <div className="flex items-center gap-4 px-2 py-1">
                                    <Stamp className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                    <div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">Hivatalos NVI adatbázis utolsó frissítés: <span className="font-bold text-slate-600 dark:text-slate-400 transition-colors">{candidate.allapot_valt ? new Date(candidate.allapot_valt).toLocaleString('hu-HU') : 'Ismeretlen'}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Watermark */}
                            <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-5 transition-colors">
                                <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest transition-colors">Generálva a Választás '26 Elemző Rendszerrel</p>
                            </div>
                        </div>
                    </div>

                    {/* Akció Gombok (Kijön a rögzített területről) */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={exportImage}
                            disabled={isExporting}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-75 disabled:cursor-wait text-sm sm:text-base"
                        >
                            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            <span className="truncate">{isExporting ? 'Kép készítése...' : 'Mentés képként'}</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex-1 sm:flex-none sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-6 py-3.5 rounded-xl font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm sm:text-base"
                        >
                            {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
                            <span className="truncate">{isCopied ? 'Másolva!' : 'Megosztás'}</span>
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}

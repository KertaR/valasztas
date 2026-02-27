import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, UserCircle2, Building2, Map, Command, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl, getInitials } from '../utils/helpers';

export default function GlobalSearchModal({ isOpen, onClose, enrichedData, onSelectCandidate, onSelectOrg, onSelectOevk }) {
    const [search, setSearch] = useState('');
    const inputRef = useRef(null);

    // Auto-focus the input whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setSearch('');
        }
    }, [isOpen]);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const results = useMemo(() => {
        if (!search || search.length < 2) return { candidates: [], orgs: [], oevks: [] };
        const query = search.toLowerCase();

        // Keresés jelöltekben
        const cands = enrichedData.candidates?.filter(c =>
            c.neve.toLowerCase().includes(query) ||
            c.partyNames.toLowerCase().includes(query) ||
            c.districtName.toLowerCase().includes(query)
        ).slice(0, 5) || [];

        // Keresés szervezetekben
        const orgs = enrichedData.organizations?.filter(o =>
            !o.isCoalitionPartner && (
                (o.nev && o.nev.toLowerCase().includes(query)) ||
                (o.r_nev && o.r_nev.toLowerCase().includes(query)) ||
                (o.coalitionFullName && o.coalitionFullName.toLowerCase().includes(query)) ||
                (o.coalitionAbbr && o.coalitionAbbr.toLowerCase().includes(query))
            )
        ).slice(0, 5) || [];

        // Keresés választókerületekben
        const oevks = enrichedData.districts?.filter(d =>
            d.evk_nev.toLowerCase().includes(query) ||
            d.maz_nev.toLowerCase().includes(query)
        ).slice(0, 5) || [];

        return { candidates: cands, orgs, oevks };
    }, [search, enrichedData]);

    if (!isOpen) return null;

    const hasResults = results.candidates.length > 0 || results.orgs.length > 0 || results.oevks.length > 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh] transition-colors"
                >
                    <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <Search className="w-6 h-6 text-slate-400 dark:text-slate-500 mr-3 hidden sm:block" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Keresés jelöltekre, pártokra, vagy körzetekre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 w-full"
                        />
                        <button onClick={onClose} className="p-2 ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
                            <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">ESC</span>
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                        {search.length === 0 ? (
                            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                <Command className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-semibold text-lg">Próbáld ki a globális keresőt!</p>
                                <p className="text-sm mt-1">Gépelj be egy nevet, pártot vagy megyét (min. 2 betű).</p>
                            </div>
                        ) : search.length < 2 ? (
                            <div className="px-6 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                                Gépelj még a kereséshez...
                            </div>
                        ) : !hasResults ? (
                            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="font-semibold">Nincs találat a következőre: "{search}"</p>
                            </div>
                        ) : (
                            <div className="space-y-4 p-2">
                                {/* JELÖLTEK */}
                                {results.candidates.length > 0 && (
                                    <div>
                                        <div className="px-3 pb-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jelöltek</div>
                                        {results.candidates.map(c => (
                                            <div
                                                key={c.szj}
                                                onClick={() => { onSelectCandidate(c); onClose(); }}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer group transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors overflow-hidden border border-slate-200 dark:border-slate-700 relative text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                        {c.fenykep ? (
                                                            <img
                                                                src={getImageUrl(c.fenykep)}
                                                                alt={c.neve}
                                                                crossOrigin="anonymous"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-full h-full flex items-center justify-center ${c.fenykep ? 'hidden' : ''}`}>
                                                            {getInitials(c.neve)}
                                                        </div>
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{c.neve}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.districtName}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded max-w-[100px] sm:max-w-none truncate ml-2">
                                                    {c.partyNames}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SZERVEZETEK */}
                                {results.orgs.length > 0 && (
                                    <div>
                                        <div className="px-3 pb-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">Szervezetek (Pártok)</div>
                                        {results.orgs.map(o => (
                                            <div
                                                key={o.szkod}
                                                onClick={() => { onSelectOrg(o); onClose(); }}
                                                className="flex items-center p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer group transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors mr-3 overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                                                    {o.emblema ? (
                                                        <img
                                                            src={getImageUrl(o.emblema)}
                                                            alt={o.r_nev}
                                                            crossOrigin="anonymous"
                                                            className="w-full h-full object-contain p-1"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextElementSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <Building2 className={`w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 ${o.emblema ? 'hidden' : 'block'}`} />
                                                </div>
                                                <div className="truncate flex-1">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{o.coalitionFullName || o.nev}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{o.coalitionAbbr || o.r_nev || 'Szervezet'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* OEVK */}
                                {results.oevks.length > 0 && (
                                    <div>
                                        <div className="px-3 pb-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">Választókerületek</div>
                                        {results.oevks.map(d => (
                                            <div
                                                key={`${d.maz}-${d.evk}`}
                                                onClick={() => { onSelectOevk(d); onClose(); }}
                                                className="flex items-center p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/30 cursor-pointer group transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-800 transition-colors mr-3">
                                                    <Map className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-300" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{d.evk_nev}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{d.maz_nev}, OEVK {d.evk}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

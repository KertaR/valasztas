import { Search, UserCircle2, Building2, Map, Command, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl, getInitials } from '../utils/helpers';
import { useUIContext, useDataContext, useSearch } from '../hooks';

export default function GlobalSearchModal() {
    const { isSearchOpen: isOpen, setIsSearchOpen, setSelectedCandidate, setSelectedOrg, setSelectedOevk } = useUIContext();
    const { enrichedData } = useDataContext();

    const {
        search, setSearch,
        results, flatResults,
        activeIdx, setActiveIdx,
        inputRef, activeItemRef,
        hasResults, selectResult
    } = useSearch({
        isOpen,
        enrichedData,
        onSelectCandidate: setSelectedCandidate,
        onSelectOrg: setSelectedOrg,
        onSelectOevk: setSelectedOevk,
        onClose: () => setIsSearchOpen(false)
    });

    if (!isOpen) return null;

    const onClose = () => setIsSearchOpen(false);

    // Helper to get the flat index for each item
    const getCandIdx = (i) => i;
    const getOrgIdx = (i) => results.candidates.length + i;
    const getOevkIdx = (i) => results.candidates.length + results.orgs.length + i;

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
                    {/* Keresőmező */}
                    <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <Search className="w-6 h-6 text-slate-400 dark:text-slate-500 mr-3 hidden sm:block flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Keresés jelöltekre, pártokra, vagy körzetekre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 w-full"
                        />
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            {flatResults.length > 0 && (
                                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center"><ArrowUp className="w-3 h-3" /></span>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center"><ArrowDown className="w-3 h-3" /></span>
                                    <span className="text-slate-300 dark:text-slate-600 mx-0.5">·</span>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px]">Enter</span>
                                </div>
                            )}
                            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
                                <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">ESC</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                        {search.length === 0 ? (
                            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                <Command className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-semibold text-lg">Próbáld ki a globális keresőt!</p>
                                <p className="text-sm mt-1">Gépelj be egy nevet, pártot vagy megyét (min. 2 betű).</p>
                                <div className="flex items-center justify-center gap-3 mt-4 text-xs text-slate-400 dark:text-slate-500">
                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Navigálás
                                    </span>
                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <CornerDownLeft className="w-3 h-3" /> Megnyitás
                                    </span>
                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        ESC Bezárás
                                    </span>
                                </div>
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
                                        {results.candidates.map((c, i) => {
                                            const idx = getCandIdx(i);
                                            const isActive = activeIdx === idx;
                                            return (
                                                <div
                                                    key={c.szj}
                                                    ref={isActive ? activeItemRef : null}
                                                    onClick={() => selectResult(flatResults[idx])}
                                                    onMouseEnter={() => setActiveIdx(idx)}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20' : 'hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                            {c.fenykep ? (
                                                                <img src={getImageUrl(c.fenykep)} alt={c.neve} crossOrigin="anonymous" className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                                                            ) : null}
                                                            <div className={`w-full h-full flex items-center justify-center ${c.fenykep ? 'hidden' : ''}`}>{getInitials(c.neve)}</div>
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{c.neve}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.districtName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded max-w-[100px] sm:max-w-none truncate">{c.partyNames}</div>
                                                        {isActive && <CornerDownLeft className="w-4 h-4 text-blue-400 dark:text-blue-500 flex-shrink-0" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* SZERVEZETEK */}
                                {results.orgs.length > 0 && (
                                    <div>
                                        <div className="px-3 pb-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">Szervezetek (Pártok)</div>
                                        {results.orgs.map((o, i) => {
                                            const idx = getOrgIdx(i);
                                            const isActive = activeIdx === idx;
                                            return (
                                                <div
                                                    key={o.szkod}
                                                    ref={isActive ? activeItemRef : null}
                                                    onClick={() => selectResult(flatResults[idx])}
                                                    onMouseEnter={() => setActiveIdx(idx)}
                                                    className={`flex items-center p-3 rounded-xl cursor-pointer group transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-500/20' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mr-3 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                        {o.emblema ? (
                                                            <img src={getImageUrl(o.emblema)} alt={o.r_nev} crossOrigin="anonymous" className="w-full h-full object-contain p-1"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                                                        ) : null}
                                                        <Building2 className={`w-4 h-4 text-slate-500 dark:text-slate-400 ${o.emblema ? 'hidden' : 'block'}`} />
                                                    </div>
                                                    <div className="truncate flex-1">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{o.coalitionFullName || o.nev}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{o.coalitionAbbr || o.r_nev || 'Szervezet'}</p>
                                                    </div>
                                                    {isActive && <CornerDownLeft className="w-4 h-4 text-emerald-400 dark:text-emerald-500 flex-shrink-0 ml-2" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* OEVK */}
                                {results.oevks.length > 0 && (
                                    <div>
                                        <div className="px-3 pb-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">Választókerületek</div>
                                        {results.oevks.map((d, i) => {
                                            const idx = getOevkIdx(i);
                                            const isActive = activeIdx === idx;
                                            return (
                                                <div
                                                    key={`${d.maz}-${d.evk}`}
                                                    ref={isActive ? activeItemRef : null}
                                                    onClick={() => selectResult(flatResults[idx])}
                                                    onMouseEnter={() => setActiveIdx(idx)}
                                                    className={`flex items-center p-3 rounded-xl cursor-pointer group transition-colors ${isActive ? 'bg-amber-50 dark:bg-amber-900/30 ring-2 ring-amber-500/20' : 'hover:bg-amber-50 dark:hover:bg-amber-900/30'}`}
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mr-3">
                                                        <Map className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{d.evk_nev}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{d.maz_nev}, OEVK {d.evk}</p>
                                                    </div>
                                                    {isActive && <CornerDownLeft className="w-4 h-4 text-amber-400 dark:text-amber-500 flex-shrink-0 ml-2" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    {hasResults && (
                        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-600 font-semibold">
                            <span>{flatResults.length} találat</span>
                            <span className="flex items-center gap-1">
                                <kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd>
                                navigálás
                                <kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] ml-2">↵</kbd>
                                megnyitás
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

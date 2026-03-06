import { useState, useMemo } from 'react';
import { X, UserPlus, UserMinus, RefreshCw, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../ui';
import { useUIContext, useDataContext } from '../../contexts';

const TABS = [
    { id: 'added', label: 'Hozzáadva', icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500' },
    { id: 'removed', label: 'Eltávolítva', icon: UserMinus, color: 'text-red-600 dark:text-red-400', activeBg: 'bg-red-50 dark:bg-red-900/30 border-red-500' },
    { id: 'changed', label: 'Státusz Változás', icon: RefreshCw, color: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-500' },
];

function CandidateRow({ candidate, type }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const bgColor = type === 'added'
        ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        : type === 'removed'
            ? 'bg-red-50/60 dark:bg-red-900/10 border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40 hover:bg-amber-50 dark:hover:bg-amber-900/20';

    const dotColor = type === 'added' ? 'bg-emerald-500' : type === 'removed' ? 'bg-red-500' : 'bg-amber-500';

    const now = new Date();
    const isOldChange = type === 'removed' && candidate.allapot_valt &&
        (now - new Date(candidate.allapot_valt)) > 24 * 60 * 60 * 1000;

    return (
        <div className={`rounded-xl border p-3 transition-all cursor-pointer ${bgColor}`} onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                    <div className="min-w-0">
                        <span className="font-bold text-sm text-slate-800 dark:text-white truncate block">{candidate.neve || 'Ismeretlen Jelölt'}</span>
                        {isOldChange && (
                            <span className="text-[10px] text-orange-500 dark:text-orange-400 font-semibold">
                                ⚠ Változás: {new Date(candidate.allapot_valt).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })} — NVI késve frissítette
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {type === 'changed' && candidate.oldStatusName && (
                        <span className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 font-medium line-through truncate max-w-[90px]">
                            {candidate.oldStatusName}
                        </span>
                    )}
                    <StatusBadge status={candidate.statusName || 'Ismeretlen'} />
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
            </div>


            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/40 grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Jelölő Szervezet</span>
                                <p className="text-slate-700 dark:text-slate-300 font-bold mt-0.5 truncate">{candidate.partyNames || candidate.jlcs_nev || 'Független'}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Választókerület</span>
                                <p className="text-slate-700 dark:text-slate-300 font-bold mt-0.5 truncate">{candidate.districtName || `${candidate.maz}-${candidate.evk}. körz.`}</p>
                            </div>
                            {/* Az eltávolítás oka (Eltávolítva fülön) */}
                            {type === 'removed' && candidate.removalReason && (
                                <div className="col-span-2">
                                    <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Ok</span>
                                    <p className="text-red-600 dark:text-red-400 font-bold mt-0.5 text-xs">{candidate.removalReason}</p>
                                </div>
                            )}
                            {/* Korábbi státusz (mindkét típusnál ha volt) */}
                            {(type === 'changed' || type === 'removed') && candidate.oldStatusName && (
                                <div className="col-span-2">
                                    <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Korábbi Státusz</span>
                                    <p className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">{candidate.oldStatusName}</p>
                                </div>
                            )}
                            {candidate.allapot_valt && (
                                <div className="col-span-2">
                                    <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Utolsó Változás</span>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                                        {new Date(candidate.allapot_valt).toLocaleString('hu-HU')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function CandidatesDiffModal() {
    const { isCandidatesDiffOpen: isOpen, setIsCandidatesDiffOpen } = useUIContext();
    const { enrichedData } = useDataContext();
    const onClose = () => setIsCandidatesDiffOpen(false);
    const [activeTab, setActiveTab] = useState('added');
    const [search, setSearch] = useState('');

    // Hozzáadva: CSAK azon új jelöltek, akik nem kizártak (tényleg bekerültek az aktív listára)
    const addedCandidates = useMemo(() =>
        (enrichedData?.allCandidates || []).filter(c => c.isNew && !c.isExcluded),
        [enrichedData]
    );
    // Eltávolítva: teljesen eltűnt VAGY tegnap aktív, ma kizárt (lásd useEnrichedData)
    const removedCandidates = useMemo(() => enrichedData?.removedCandidates || [], [enrichedData]);
    // Státusz Változás: aktív marad, de státusza változott (nem lett kizárt)
    const changedCandidates = useMemo(() =>
        (enrichedData?.allCandidates || []).filter(c => c.hasStatusChanged && !c.isExcluded),
        [enrichedData]
    );

    const hasDiff = addedCandidates.length > 0 || removedCandidates.length > 0 || changedCandidates.length > 0;

    const candidatesByTab = {
        added: addedCandidates,
        removed: removedCandidates,
        changed: changedCandidates,
    };

    const counts = {
        added: addedCandidates.length,
        removed: removedCandidates.length,
        changed: changedCandidates.length,
    };

    const lowerSearch = search.toLowerCase();
    const filteredCandidates = (candidatesByTab[activeTab] || []).filter(c =>
        !search || (c.neve || '').toLowerCase().includes(lowerSearch)
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh] relative transition-colors"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Fejléc */}
                    <div className="p-6 pb-0 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Induló Jelöltek — Napi Változások</h2>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                                        Összehasonlítás a tegnapi adatbázissal
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tab-ok */}
                        <div className="flex gap-1 -mb-px">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-all ${isActive
                                            ? `${tab.activeBg} ${tab.color}`
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/60 dark:bg-black/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            {counts[tab.id]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tartalom */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {!hasDiff ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                    <RefreshCw className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 font-bold text-base">Nincs változás</p>
                                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Nem állnak rendelkezésre tegnapi adatok az összehasonlításhoz, vagy nem volt változás.</p>
                            </div>
                        ) : (
                            <>
                                {/* Kereső */}
                                {filteredCandidates.length > 0 || search ? (
                                    <div className="px-6 pt-4 pb-2">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="Keresés névre..."
                                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                        />
                                    </div>
                                ) : null}

                                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-3 space-y-2">
                                    {filteredCandidates.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-slate-400 dark:text-slate-500 font-semibold">
                                                {search ? 'Nincs találat a keresési feltételre.' : 'Ezen a fülön nincs adat.'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredCandidates.map((candidate, idx) => (
                                            <CandidateRow
                                                key={candidate.ej_id || candidate.szj || idx}
                                                candidate={candidate}
                                                type={activeTab}
                                            />
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Lábléc */}
                    <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
                        Az adatok az NVI tegnapi és mai adatbázisa alapján lettek összeállítva.
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

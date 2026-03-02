import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Plus, Trash2, Map, AlertTriangle, CheckCircle2, Search, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

// Segédfüggvény a megyei kódok / nevek feloldására (ha nincs meg azonnal)
const calculateListProgress = (uniqueOevksSet, registeredOevksSet, candidatesList) => {
    const oevks = Array.from(uniqueOevksSet);
    const registered = Array.from(registeredOevksSet);

    // Kikeressük az OEVK-khoz tartozó megyéket (c.maz ből)
    const counties = new Set();
    const registeredCounties = new Set();

    candidatesList.forEach(c => {
        const key = `${c.maz}-${c.evk}`;
        if (uniqueOevksSet.has(key)) counties.add(c.maz);
        if (registeredOevksSet.has(key)) registeredCounties.add(c.maz);
    });

    const hasBudapestRegistered = Array.from(registeredCounties).some(c => c === '01');
    const hasBudapestAll = Array.from(counties).some(c => c === '01');

    return {
        totalCoverage: oevks.length,
        registeredCoverage: registered.length,
        totalCounties: counties.size,
        registeredCounties: registeredCounties.size,
        meetsListRequirement: registered.length >= 71 && registeredCounties.size >= 14 && hasBudapestRegistered,
        potentialListRequirement: oevks.length >= 71 && counties.size >= 14 && hasBudapestAll
    };
};

export default function CoalitionBuilderTab({ enrichedData }) {
    const [selectedPartyIds, setSelectedPartyIds] = useState([]);
    const [partySearch, setPartySearch] = useState('');
    const simResultRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const exportSimulation = async () => {
        if (!simResultRef.current) return;
        setIsExporting(true);
        try {
            const { toPng: tp } = await import('html-to-image');
            const dataUrl = await tp(simResultRef.current, {
                cacheBust: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `koalicio_szimulacio_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const availableParties = useMemo(() => {
        return enrichedData.organizations
            .filter(org => !org.isCoalitionPartner && org.szkod !== 0) // exclude independent / already partners
            .filter(org => !selectedPartyIds.includes(org.szkod))
            .filter(org => (org.r_nev || org.nev).toLowerCase().includes(partySearch.toLowerCase()))
            .sort((a, b) => b.candidateCount - a.candidateCount); // Legnagyobbak elöl
    }, [enrichedData.organizations, selectedPartyIds, partySearch]);

    const selectedParties = useMemo(() => {
        return selectedPartyIds.map(id => enrichedData.organizations.find(o => o.szkod === id)).filter(Boolean);
    }, [selectedPartyIds, enrichedData.organizations]);

    // Szimuláció kalkulációja
    const simulation = useMemo(() => {
        if (selectedParties.length === 0) return null;

        // Összes érintett jelölt (amelyik bármelyik kiválasztott szervezetnél indul)
        const allCandidates = enrichedData.candidates.filter(c =>
            c.jelolo_szervezetek && c.jelolo_szervezetek.some(szkod => selectedPartyIds.includes(szkod))
        );

        const uniqueOevks = new Set();
        const registeredOevks = new Set();
        const oevkConflicts = {}; // { '01-01': [Candidate1, Candidate2] }

        // Összegyűjtjük az OEVK-kat és a potenciális konfliktusokat
        allCandidates.forEach(c => {
            const key = `${c.maz}-${c.evk}`;
            uniqueOevks.add(key);

            if (c.statusName === 'Nyilvántartásba véve' || c.statusName.includes('(jogerős)')) {
                registeredOevks.add(key);
            }

            if (!oevkConflicts[key]) oevkConflicts[key] = [];
            oevkConflicts[key].push(c);
        });

        // Csak azokat tartjuk meg ütközésnek, ahol több KÜLÖNBÖZŐ személy indul (ha ugyanazt jelölik közösen, az nem ütközés - bár a NVI struktúrában ők eleve 1 arrayben lennének, de jobb biztosra menni)
        const realConflicts = Object.entries(oevkConflicts)
            .filter(([key, candidatesInSeat]) => {
                const uniquePeople = new Set(candidatesInSeat.map(c => c.szj || c.neve));
                return uniquePeople.size > 1;
            })
            .map(([key, candidatesInSeat]) => ({
                oevkKey: key,
                districtName: candidatesInSeat[0].districtName || key,
                candidates: candidatesInSeat
            }));

        const progress = calculateListProgress(uniqueOevks, registeredOevks, allCandidates);

        // Hiányzó OEVK-k megkeresése
        const missingOevks = enrichedData.districts.filter(d => !uniqueOevks.has(`${d.maz}-${d.evk}`));

        return {
            totalCandidatesProcessed: allCandidates.length,
            uniqueOevks: Array.from(uniqueOevks),
            registeredOevks: Array.from(registeredOevks),
            conflicts: realConflicts,
            progress,
            missingOevks
        };

    }, [selectedPartyIds, enrichedData.candidates, enrichedData.districts]);

    const addParty = (id) => {
        setSelectedPartyIds(prev => [...prev, id]);
        setPartySearch('');
    };

    const removeParty = (id) => {
        setSelectedPartyIds(prev => prev.filter(pId => pId !== id));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Összefogás Tervező
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Szimuláld különböző pártok szövetségét és nézd meg az együttes listaállítási esélyeiket.</p>
                </div>
                {simulation && (
                    <button
                        onClick={exportSimulation}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-sm transition-all hover:bg-slate-700 dark:hover:bg-white disabled:opacity-70 text-sm"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export képként
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Bal Oldal: Pártok Kiválasztása */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 transition-colors">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Szövetség Tagjai</h2>

                        <div className="space-y-2 mb-6">
                            <AnimatePresence>
                                {selectedParties.map(org => (
                                    <motion.div
                                        key={org.szkod}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                        className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-3 rounded-xl"
                                    >
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="font-bold text-sm text-indigo-900 dark:text-indigo-300 truncate">{org.r_nev || org.nev}</p>
                                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">{org.candidateCount} egyéni jelölt összesen</p>
                                        </div>
                                        <button onClick={() => removeParty(org.szkod)} className="p-2 text-indigo-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {selectedParties.length === 0 && (
                                <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500">
                                    Még nem adtál hozzá pártot. Keresd meg és válaszd ki őket lentebb!
                                </div>
                            )}
                        </div>

                        <div className="relative mb-3">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Párt keresése..."
                                value={partySearch}
                                onChange={(e) => setPartySearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                            />
                        </div>

                        <div className="h-64 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800/50">
                            {availableParties.map(org => (
                                <button
                                    key={org.szkod}
                                    onClick={() => addParty(org.szkod)}
                                    className="w-full flex items-center items-stretch hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                                >
                                    <div className="flex-1 p-3">
                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{org.r_nev || org.nev}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{org.candidateCount} jelölt</p>
                                    </div>
                                    <div className="w-12 flex items-center justify-center border-l border-slate-100 dark:border-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Jobb Oldal: Szimulációs Eredmények */}
                <div className="xl:col-span-2 space-y-6">
                    {simulation ? (
                        <div className="space-y-6" ref={simResultRef}>

                            {/* Fő KPI Kártyák */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Együttes OEVK Lefedettség</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-slate-800 dark:text-white">{simulation.progress.totalCoverage}</span>
                                        <span className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-1">/ 106</span>
                                    </div>
                                    {/* Dupla progress bár: kék=összes, zöld=regisztrált */}
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full mt-3 overflow-hidden relative">
                                        <div className="bg-indigo-200 dark:bg-indigo-900 h-full transition-all absolute inset-0 rounded-full" style={{ width: `${(simulation.progress.totalCoverage / 106) * 100}%` }} />
                                        <div className="bg-emerald-500 h-full transition-all absolute inset-0 rounded-full" style={{ width: `${(simulation.progress.registeredCoverage / 106) * 100}%` }} />
                                    </div>
                                    <div className="flex justify-between text-xs font-semibold mt-1.5">
                                        <span className="text-indigo-500">{simulation.progress.totalCoverage} összes jelölt</span>
                                        <span className="text-emerald-500">{simulation.progress.registeredCoverage} nyilvántartva</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Közös Jelöltek Száma</p>
                                    <p className="text-4xl font-black text-slate-800 dark:text-white">{simulation.totalCandidatesProcessed}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{simulation.conflicts.length > 0 ? `${simulation.conflicts.length} db OEVK-ban ütközés van!` : 'Nincs ütközés.'}</p>
                                </div>
                                <div className={`p-5 rounded-2xl shadow-sm border ${simulation.progress.potentialListRequirement ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50'}`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${simulation.progress.potentialListRequirement ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>Országos Lista Esély (Bárki)</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        {simulation.progress.potentialListRequirement
                                            ? <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                            : <AlertTriangle className="w-10 h-10 text-amber-500" />
                                        }
                                        <p className={`font-bold text-sm ${simulation.progress.potentialListRequirement ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                            {simulation.progress.potentialListRequirement ? "Eléri a listaállítási küszöböt a jelöltekkel!" : "Nem éri el a listaállítási feltételeket (71 OEVK, 14 vármegye + BP)."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ütközések Kártyája */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[500px]">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-900/10 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-500" /> Belső Ütközések
                                        </h3>
                                        <span className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 py-0.5 px-2.5 rounded-full text-xs font-black">{simulation.conflicts.length} db</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-0">
                                        {simulation.conflicts.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                                <p>Nincsenek egymásra indított jelöltek a szövetségben.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                                {simulation.conflicts.map((conflict, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <p className="font-bold text-sm text-slate-800 dark:text-white mb-2">{conflict.districtName}</p>
                                                        <div className="space-y-2">
                                                            {conflict.candidates.map((c, i) => (
                                                                <div key={i} className="flex flex-col border-l-2 border-red-400 pl-3">
                                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.neve}</span>
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.partyNames}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hiányzó Körzetek Kártyája */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[500px]">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <Map className="w-5 h-5 text-slate-400" /> Hiányzó OEVK-k
                                        </h3>
                                        <span className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 py-0.5 px-2.5 rounded-full text-xs font-black">{simulation.missingOevks.length} db</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-0">
                                        {simulation.missingOevks.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                                <p>Minden választókerület le van fedve!</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                                {simulation.missingOevks.map((d, idx) => (
                                                    <div key={idx} className="p-3 text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{d.maz_nev} {d.evk}.</span>
                                                        <span className="text-slate-400 text-xs flex-1 text-right truncate">{d.evk_nev}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-300 rounded-full flex items-center justify-center mb-6">
                                <Network className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Válassz ki pártokat a szimulációhoz</h2>
                            <p className="text-slate-500 max-w-sm">A kiválasztott szervezetcsoportra vonatkozó listaállítási feltételek és közös adatok itt fognak megjelenni.</p>
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
}

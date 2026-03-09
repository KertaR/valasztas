import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Search, Info } from 'lucide-react';
import { PageLayout } from '../components/ui';
import { useDataContext } from '../contexts';
import FormationCard from '../components/national-lists/FormationCard';
import OfficialListModal from '../components/national-lists/OfficialListModal';

const NationalListsTab = () => {
    const { enrichedData } = useDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormation, setSelectedFormation] = useState(null); // Modal state
    const [statusFilter, setStatusFilter] = useState('all'); // all | sure | possible | official | none

    // Formations with official lists injected
    const listsData = useMemo(() => {
        if (!enrichedData || !enrichedData.formationsProgress || !enrichedData.organizations) return [];

        return enrichedData.formationsProgress.map(f => {
            let officialCandidates = null;
            let officialStatus = null;

            // Check if any of the base organizations in this formation have an official list registered
            for (let szkod of f.szkods) {
                const org = enrichedData.organizations.find(o => o.szkod === szkod);
                if (org && org.nationalListCandidates && org.nationalListCandidates.length > 0) {
                    officialCandidates = org.nationalListCandidates;
                    officialStatus = org.nationalListStatus;
                    break;
                }
            }
            return { ...f, officialCandidates, officialStatus };
        }).sort((a, b) => {
            // Priority 1: Has official list
            if (a.officialCandidates && !b.officialCandidates) return -1;
            if (!a.officialCandidates && b.officialCandidates) return 1;

            // Priority 2: Is Sure to get it
            if (a.isSure && !b.isSure) return -1;
            if (!a.isSure && b.isSure) return 1;

            // Priority 3: Is Possible
            if (a.isPossible && !b.isPossible) return -1;
            if (!a.isPossible && b.isPossible) return 1;

            // Priority 4: Total OEVK count
            return b.totalOevkCount - a.totalOevkCount;
        });
    }, [enrichedData]);

    const filteredData = listsData.filter(f => {
        // Find matching candidates
        let matchingCandidates = [];
        if (f.officialCandidates) {
            matchingCandidates = f.officialCandidates.filter(cand =>
                cand.neve.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const matchesSearch = f.abbr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            matchingCandidates.length > 0;

        if (!matchesSearch) return false;

        if (statusFilter === 'official') return !!f.officialCandidates;
        if (statusFilter === 'sure') return f.isSure && !f.officialCandidates;
        if (statusFilter === 'possible') return f.isPossible && !f.isSure && !f.officialCandidates;
        if (statusFilter === 'none') return !f.isSure && !f.isPossible && !f.officialCandidates;
        return true;
    });

    const counts = {
        all: listsData.length,
        official: listsData.filter(f => !!f.officialCandidates).length,
        sure: listsData.filter(f => f.isSure && !f.officialCandidates).length,
        possible: listsData.filter(f => f.isPossible && !f.officialCandidates).length,
        none: listsData.filter(f => !f.isSure && !f.isPossible && !f.officialCandidates).length,
    };

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (selectedFormation) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedFormation]);

    return (
        <PageLayout
            title="Országos Listák"
            subtitle="A pártok és pártszövetségek haladása az országos listaállításhoz, és a hivatalosan bejelentett listák."
            icon={List}
            actions={
                <div className="relative w-full md:w-72 mt-2 md:mt-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Formáció vagy jelölt keresése..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm transition-all shadow-sm"
                    />
                </div>
            }
        >
            {/* Szűrő sáv */}
            <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                {[
                    { key: 'all', label: 'Összes', count: counts.all, cls: 'bg-slate-800 text-white dark:bg-white dark:text-slate-900', inactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                    { key: 'official', label: 'Hivatalos Lista', count: counts.official, cls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300', inactive: 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' },
                    { key: 'sure', label: 'Jogosult', count: counts.sure, cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300', inactive: 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
                    { key: 'possible', label: 'Küzd', count: counts.possible, cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300', inactive: 'text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20' },
                    { key: 'none', label: 'Nincs esély', count: counts.none, cls: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300', inactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                ].map(({ key, label, count, cls, inactive }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${statusFilter === key ? cls + ' shadow-sm' : inactive
                            }`}
                    >
                        {label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${statusFilter === key ? 'bg-white/30 dark:bg-black/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>{count}</span>
                    </button>
                ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-4 rounded-xl flex items-start flex-col sm:flex-row gap-4 shadow-sm">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 hidden sm:block" />
                <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    <div className="flex items-center gap-2 mb-1 sm:hidden">
                        <Info className="w-4 h-4 text-blue-500" />
                        <strong className="text-blue-900 dark:text-blue-200">Listaállítási szabályok</strong>
                    </div>
                    Országos pártlistát az a párt (vagy pártszövetség) állíthat, amely legalább <strong>14 vármegyében és a fővárosban</strong>, összesen legalább <strong>71 egyéni választókerületben</strong> induló jelöltet állított.
                </div>
            </div>

            {/* Kártyák Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {filteredData.map(f => (
                    <FormationCard
                        key={f.key}
                        f={f}
                        searchTerm={searchTerm}
                        onPreviewClick={setSelectedFormation}
                    />
                ))}

                {filteredData.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        Nincs a keresésnek megfelelő formáció.
                    </div>
                )}
            </div>

            {/* MODAL a teljes listához */}
            <AnimatePresence>
                {selectedFormation && (
                    <OfficialListModal
                        selectedFormation={selectedFormation}
                        searchTerm={searchTerm}
                        onClose={() => setSelectedFormation(null)}
                    />
                )}
            </AnimatePresence>

        </PageLayout>
    );
};

export default NationalListsTab;

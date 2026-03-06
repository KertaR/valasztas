import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, List, Zap } from 'lucide-react';

// Organizations Components
import { OrganizationsGrid, OrganizationsTable } from '../components';
import { useUIContext, useDataContext } from '../contexts';

export default function OrganizationsTab() {
    const { enrichedData } = useDataContext();
    const { setSelectedOrg } = useUIContext();
    const [viewMode, setViewMode] = useState('grid');
    const [showOnlyNew, setShowOnlyNew] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('coverage'); // 'coverage', 'candidates', 'name'

    const filteredAndSortedOrgs = useMemo(() => {
        let list = enrichedData.organizations.filter(org => !org.isCoalitionPartner);

        if (showOnlyNew) {
            list = list.filter(org => org.isNew);
        }

        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            list = list.filter(org =>
                (org.nev && org.nev.toLowerCase().includes(lowerQuery)) ||
                (org.r_nev && org.r_nev.toLowerCase().includes(lowerQuery)) ||
                (org.coalitionAbbr && org.coalitionAbbr.toLowerCase().includes(lowerQuery)) ||
                (org.coalitionFullName && org.coalitionFullName.toLowerCase().includes(lowerQuery))
            );
        }

        list.sort((a, b) => {
            if (sortBy === 'coverage') {
                if (b.registeredFinalOevkCoverage !== a.registeredFinalOevkCoverage) {
                    return b.registeredFinalOevkCoverage - a.registeredFinalOevkCoverage;
                }
                return b.oevkCoverage - a.oevkCoverage;
            }
            if (sortBy === 'candidates') {
                return b.candidateCount - a.candidateCount;
            }
            if (sortBy === 'name') {
                const nameA = a.coalitionAbbr || a.r_nev || a.nev || '';
                const nameB = b.coalitionAbbr || b.r_nev || b.nev || '';
                return nameA.localeCompare(nameB);
            }
            return 0;
        });

        return list;
    }, [enrichedData.organizations, showOnlyNew, searchTerm, sortBy]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto transition-colors">
            {/* Fejléc és Vezérlők */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white transition-colors">Jelölő Szervezetek</h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">Magyarországon bejegyzett pártok és egyesületek választási jelenléte.</p>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-black/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Grid className="w-4 h-4" /> Kártyák
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-black/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <List className="w-4 h-4" /> Táblázat
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Keresés szervezet nevére vagy rövidítésére..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none flex-shrink-0"
                        >
                            <option value="coverage">Rendezés: Lefedettség</option>
                            <option value="candidates">Rendezés: Jelöltek száma</option>
                            <option value="name">Rendezés: Név (A-Z)</option>
                        </select>
                        <button
                            onClick={() => setShowOnlyNew(!showOnlyNew)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all border shadow-sm outline-none flex-shrink-0 ${showOnlyNew ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/50' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            title="Csak az újonnan alakult szervezetek megjelenítése"
                        >
                            <Zap className={`w-4 h-4 ${showOnlyNew ? 'fill-current' : ''}`} />
                            <span className="hidden sm:inline">{showOnlyNew ? 'Újakra szűrve' : 'Csak újak'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tartalom */}
            <AnimatePresence mode="popLayout">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <OrganizationsGrid organizations={filteredAndSortedOrgs} onSelect={setSelectedOrg} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <OrganizationsTable organizations={filteredAndSortedOrgs} onSelect={setSelectedOrg} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ArrowUpDown } from 'lucide-react';
import { DistrictGrid, DistrictHeatmap } from '../components';

export default function OevkTab({ enrichedData, setSelectedOevk }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, hot, empty
    const [sortBy, setSortBy] = useState('candidates'); // candidates, name

    const filteredDistricts = useMemo(() => {
        let result = [...enrichedData.districts];

        // Filter by intensity
        if (filter === 'hot') result = result.filter(d => d.candidateCount >= 8);
        if (filter === 'empty') result = result.filter(d => d.candidateCount <= 2);

        // Filter by search
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(d =>
                d.evk_nev.toLowerCase().includes(lowSearch) ||
                d.maz_nev.toLowerCase().includes(lowSearch)
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'candidates') return b.candidateCount - a.candidateCount;
            return a.evk_nev.localeCompare(b.evk_nev);
        });

        return result;
    }, [enrichedData.districts, filter, searchTerm, sortBy]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-6xl mx-auto transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white transition-colors">Választókerületek (OEVK)</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium transition-colors">Választókerületi adatok és jelöltfelhalmozódás elemzése.</p>
                </div>
            </div>

            <DistrictHeatmap districts={enrichedData.districts} onSelect={setSelectedOevk} />

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 transition-colors">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Keresés név vagy megye alapján..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 ring-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Összes
                        </button>
                        <button
                            onClick={() => setFilter('hot')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'hot' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Forró
                        </button>
                        <button
                            onClick={() => setFilter('empty')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'empty' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Hideg
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setSortBy(sortBy === 'candidates' ? 'name' : 'candidates')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    Rendezés: {sortBy === 'candidates' ? 'Jelöltszám' : 'Név'}
                </button>
            </div>

            <DistrictGrid districts={filteredDistricts} onSelect={setSelectedOevk} />

            {filteredDistricts.length === 0 && (
                <div className="py-20 text-center">
                    <Filter className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-400 dark:text-slate-500 font-bold">Nem található a szűrésnek megfelelő választókerület.</p>
                </div>
            )}
        </motion.div>
    );
}
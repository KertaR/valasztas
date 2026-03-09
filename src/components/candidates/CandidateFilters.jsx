import { Zap } from 'lucide-react';
import { SearchField, FilterSelect } from '../ui';

export default function CandidateFilters({
    searchTerm, setSearchTerm,
    quickFilter, setQuickFilter,
    selectedCounty, setSelectedCounty,
    selectedParty, setSelectedParty,
    selectedStatus, setSelectedStatus,
    filterOptions
}) {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-5 flex-shrink-0 transition-all">
            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-1">
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2">Nézetek</span>
                <button
                    onClick={() => setQuickFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${quickFilter === 'all' ? 'bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white shadow-sm ring-1 ring-slate-900 dark:ring-white scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    Összes Jelölt
                </button>
                <button
                    onClick={() => setQuickFilter('new')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${quickFilter === 'new' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30 scale-105' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800/30'}`}
                >
                    <Zap className="w-3.5 h-3.5" fill="currentColor" /> Csak Újak
                </button>
                <button
                    onClick={() => setQuickFilter('registered')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${quickFilter === 'registered' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30 scale-105' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800/30'}`}
                >
                    Jogerősek
                </button>
                <button
                    onClick={() => setQuickFilter('independent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${quickFilter === 'independent' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm shadow-purple-500/30 scale-105' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800/30'}`}
                >
                    Függetlenek
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 relative">
                <SearchField
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Keresés névre..."
                />

                <FilterSelect
                    value={selectedCounty}
                    onChange={setSelectedCounty}
                    options={filterOptions.counties}
                    defaultOptionLabel="Összes vármegye"
                />

                <FilterSelect
                    value={selectedParty}
                    onChange={setSelectedParty}
                    options={filterOptions.parties}
                    defaultOptionLabel="Összes szervezet"
                />

                <FilterSelect
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={filterOptions.statuses}
                    defaultOptionLabel="Összes állapot"
                />
            </div>
        </div>
    );
}

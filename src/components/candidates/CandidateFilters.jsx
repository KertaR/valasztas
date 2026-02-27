import { Search, Zap, Filter } from 'lucide-react';

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
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Keresés névre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-[14px] group-focus-within:text-blue-500 transition-colors" />
                </div>

                <div className="relative group">
                    <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-[14px] group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <select
                        value={selectedCounty}
                        onChange={(e) => setSelectedCounty(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800"
                    >
                        <option value="">Összes vármegye</option>
                        {filterOptions.counties.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="relative group">
                    <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-[14px] group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <select
                        value={selectedParty}
                        onChange={(e) => setSelectedParty(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800"
                    >
                        <option value="">Összes szervezet</option>
                        {filterOptions.parties.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="relative group">
                    <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-[14px] group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800"
                    >
                        <option value="">Összes állapot</option>
                        {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
}

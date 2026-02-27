import { useState } from 'react';
import { Download, LayoutGrid, List, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

// Candidate Components
import { CandidateFilters, CandidateTable, CandidateGrid, CandidatePagination } from '../components';

export default function CandidatesTab({
    processedCandidates, exportToCSV,
    quickFilter, setQuickFilter,
    searchTerm, setSearchTerm,
    selectedCounty, setSelectedCounty,
    filterOptions,
    selectedParty, setSelectedParty,
    selectedStatus, setSelectedStatus,
    handleSort, sortConfig,
    paginatedCandidates, setSelectedCandidate,
    currentPage, setCurrentPage,
    itemsPerPage, totalPages
}) {
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    const getSortIcon = (key) => {
        if (!sortConfig) return <ChevronDown className="w-4 h-4 ml-1 inline opacity-20" />;
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc'
                ? <ChevronUp className="w-4 h-4 ml-1 inline" />
                : <ChevronDown className="w-4 h-4 ml-1 inline" />;
        }
        return <ChevronDown className="w-4 h-4 ml-1 inline opacity-20" />;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4 md:space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-120px)] md:h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white transition-colors">Egyéni Jelöltek</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">{processedCandidates.length} találat az adatbázisban</p>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-3">
                    <div className="hidden sm:flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                    <button onClick={exportToCSV} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
                        <Download className="w-4 h-4" /> Exportálás (CSV)
                    </button>
                </div>
            </div>

            <CandidateFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                quickFilter={quickFilter} setQuickFilter={setQuickFilter}
                selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty}
                selectedParty={selectedParty} setSelectedParty={setSelectedParty}
                selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
                filterOptions={filterOptions}
            />

            <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col min-h-[400px] transition-colors ${viewMode === 'grid' ? 'bg-transparent border-none shadow-none' : ''}`}>
                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                    {viewMode === 'table' ? (
                        <CandidateTable
                            candidates={paginatedCandidates}
                            searchTerm={searchTerm}
                            handleSort={handleSort}
                            getSortIcon={getSortIcon}
                            setSelectedCandidate={setSelectedCandidate}
                        />
                    ) : (
                        <CandidateGrid
                            candidates={paginatedCandidates}
                            searchTerm={searchTerm}
                            setSelectedCandidate={setSelectedCandidate}
                        />
                    )}

                    {paginatedCandidates.length === 0 && (
                        <div className="p-8 md:p-16 text-center flex flex-col items-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-full">
                            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg">Nincs a feltételeknek megfelelő jelölt.</p>
                        </div>
                    )}
                </div>

                <CandidatePagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    totalItems={processedCandidates.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </motion.div>
    );
}

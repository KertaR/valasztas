import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CandidatePagination({
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage
}) {
    if (totalItems === 0) return null;

    const startIdx = (currentPage - 1) * itemsPerPage + 1;
    const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="bg-slate-50 dark:bg-slate-800 p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
            <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
                Mutatva: <span className="font-bold text-slate-800 dark:text-slate-200">{startIdx}</span> - <span className="font-bold text-slate-800 dark:text-slate-200">{endIdx}</span> / {totalItems}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 md:p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 px-2 md:px-3 bg-white dark:bg-slate-900 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 md:p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
        </div>
    );
}

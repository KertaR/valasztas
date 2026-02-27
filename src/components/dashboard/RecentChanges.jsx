import { Clock, Calendar } from 'lucide-react';

export default function RecentChanges({ recentUpdates, setSelectedCandidate }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 flex-1 flex flex-col transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Legutóbbi Változások
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[300px] custom-scrollbar">
                {recentUpdates.map((update, idx) => (
                    <div
                        key={idx}
                        className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => setSelectedCandidate(update)}
                    >
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5 flex items-center gap-1 uppercase">
                            <Calendar className="w-3 h-3" />
                            {new Date(update.allapot_valt).toLocaleString('hu-HU')}
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{update.neve}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{update.statusName}</div>
                    </div>
                ))}
                {recentUpdates.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Nincsenek friss adatok.</p>
                )}
            </div>
        </div>
    );
}

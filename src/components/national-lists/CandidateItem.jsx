import React from 'react';
import { Users } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

export const CandidateItem = ({ cand, isMatch, variant = 'compact' }) => {
    const isCompact = variant === 'compact';

    // Classes
    const containerClasses = isCompact
        ? `flex items-center gap-3 rounded-lg p-2 border ${isMatch ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/50'}`
        : `flex items-center gap-3 bg-white dark:bg-slate-800 border rounded-xl p-2.5 shadow-sm transition-colors group ${isMatch ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`;

    const numClasses = isCompact
        ? `w-6 text-center text-xs font-black ${isMatch ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`
        : `w-10 h-10 rounded-lg border font-bold flex items-center justify-center text-sm flex-shrink-0 transition-colors ${isMatch ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`;

    const imgWrapperClasses = isCompact
        ? `w-8 h-8 rounded-md bg-white dark:bg-slate-800 border overflow-hidden flex-shrink-0 ${isMatch ? 'border-blue-200 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700'}`
        : `w-12 h-12 rounded-lg shrink-0 overflow-hidden border shadow-sm ${isMatch ? 'border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800'}`;

    const txtClasses = isCompact
        ? "text-sm font-bold text-slate-800 dark:text-white truncate"
        : "text-base font-bold text-slate-800 dark:text-slate-100 truncate";

    return (
        <div className={containerClasses}>
            <div className={numClasses}>{cand.sorsz}.</div>
            {isCompact ? (
                <>
                    <div className={imgWrapperClasses}>
                        {cand.fenykep ? (
                            <img src={getImageUrl(cand.fenykep)} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isMatch ? 'text-blue-400' : 'text-slate-300'}`}><Users className="w-4 h-4" /></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className={txtClasses} title={cand.neve}>{cand.neve}</div>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex-1 min-w-0">
                        <div className={txtClasses} title={cand.neve}>{cand.neve}</div>
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{cand.statusName}</div>
                    </div>
                    {cand.fenykep && (
                        <div className={imgWrapperClasses}>
                            <img src={getImageUrl(cand.fenykep)} className="w-full h-full object-cover" alt="" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CandidateItem;

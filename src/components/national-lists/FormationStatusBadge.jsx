import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, ShieldCheck } from 'lucide-react';

const FormationStatusBadge = ({ f, hasOfficial }) => {
    if (hasOfficial) {
        return (
            <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Hivatalos Lista</span>
                </div>
                {f.officialStatus && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm ${f.officialStatus === 'Nyilvántartásba véve'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                        }`}>
                        {f.officialStatus}
                    </span>
                )}
            </>
        );
    }
    if (f.isSure) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Jogosult</span>
            </div>
        );
    }
    if (f.isPossible) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Küzd</span>
            </div>
        );
    }
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Nincs esély</span>
        </div>
    );
};

export default FormationStatusBadge;

import { AlertTriangle } from 'lucide-react';

export default function CoverageGaps({ partyGaps }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg transition-colors">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white transition-colors">Szervezeti Hiányhelyek</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Megyei fehér foltok a nagyobb pártoknál</p>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {partyGaps.map((gap, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-transparent hover:border-amber-100 dark:hover:border-amber-900/50 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-black text-slate-900 dark:text-white text-sm px-3 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">{gap.name}</span>
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {gap.gapCount} Megye Hiányzik
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 focus-within:ring-2 ring-blue-500">
                            {gap.missingCounties.map((m, midx) => (
                                <span key={midx} className="text-[9px] font-bold px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-800 transition-colors">
                                    {m}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

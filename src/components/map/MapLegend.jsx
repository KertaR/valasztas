export default function MapLegend({ selectedParty }) {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white/20 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Jelmagyarázat</h3>

            {selectedParty === 'all' ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-[#991b1b] border border-red-900 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Extrém csatatér (12+)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-[#ef4444] border border-red-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Erős csatatér (10-11)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-[#fca5a5] border border-red-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Kezdődő csatatér (8-9)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="w-5 h-5 rounded bg-blue-200 border border-blue-300 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Átlagos körzet</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-slate-200 border border-slate-300 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nincs adat</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#14532d] border border-green-950 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Jogerős jelölt</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#86efac] border border-green-300 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Nyilv. véve (nem jogerős)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#60a5fa] border border-blue-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Folyamatban / Bejelentve</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#fca5a5] border border-red-300 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Visszautasítva (nem jogerős)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#991b1b] border border-red-900 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Visszautasítva (jogerős)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#ef4444] border border-red-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Törölve / Kiesett</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Nincs jelölt (fehér folt)</span>
                    </div>
                </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                    A térkép a pártok területi lefedettségét mutatja. A fehér foltok komoly stratégiai hátrányt jelenthetnek!
                </div>
            </div>
        </div>
    );
}

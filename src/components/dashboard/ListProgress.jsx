import { Target } from 'lucide-react';

export default function ListProgress({ organizations }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Listaállítási Haladás
            </h3>
            <div className="space-y-8">
                {organizations
                    .filter(org => !org.isCoalitionPartner && org.registeredFinalOevkCoverage > 0)
                    .slice(0, 4)
                    .map(org => {
                        const oevkProgress = Math.min(100, (org.registeredFinalOevkCoverage / 71) * 100);
                        const countyProgress = Math.min(100, (org.registeredFinalCountiesCount / 15) * 100);
                        const hasList = org.registeredFinalOevkCoverage >= 71 && org.registeredFinalCountiesCount >= 15;

                        return (
                            <div key={org.szkod} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[150px]">{org.coalitionFullName || org.nev}</span>
                                        {hasList && <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-bounce shadow-sm shadow-emerald-500/50 uppercase">Elérve</span>}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Lista: {org.coalitionAbbr || org.r_nev}</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                        <span className="text-slate-500 dark:text-slate-400">71 OEVK Jelölt (Indult: {org.oevkCoverage})</span>
                                        <span className={hasList ? 'text-emerald-500' : 'text-blue-500'}>{org.registeredFinalOevkCoverage} / 71</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                                        {/* Background bar for total launched */}
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 absolute inset-0 opacity-30"></div>
                                        <div
                                            className={`h-full transition-all duration-1000 relative z-10 ${hasList ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-blue-500'}`}
                                            style={{ width: `${oevkProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                        <span>14 Vármegye + Budapest</span>
                                        <span>{org.registeredFinalCountiesCount} / 15</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                                        <div
                                            className={`h-full transition-all duration-1000 ${hasList ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                            style={{ width: `${countyProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 italic leading-tight">
                * A választási törvény szerint országos listát az a párt állíthat, amely legalább 14 vármegyében és a fővárosban, összesen legalább 71 egyéni választókerületben állított jogerősen nyilvántartásba vett jelöltet.
            </div>
        </div>
    );
}

import { Swords, ChevronRight } from 'lucide-react';

export default function BattlegroundList({ battlegrounds, onSelect }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/10 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg transition-colors">
                        <Swords className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white transition-colors">Kiemelt Csataterek</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Választókerületek a legmagasabb jelöltszámmal (8+)</p>
            </div>

            <div className="p-6 space-y-4">
                {battlegrounds.map((oevk, idx) => (
                    <div
                        key={idx}
                        onClick={() => onSelect(oevk)}
                        className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-red-100 dark:hover:shadow-none border border-transparent hover:border-red-100 dark:hover:border-red-900/50 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center font-black text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                {oevk.candidateCount}
                            </div>
                            <div>
                                <p className="font-black text-slate-800 dark:text-slate-100 leading-tight transition-colors">{oevk.evk_nev}</p>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-0.5">{oevk.maz_nev} • {oevk.evk}. kerület</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-400 transition-colors" />
                    </div>
                ))}
                {battlegrounds.length === 0 && (
                    <div className="p-12 text-center text-slate-400 italic">Nincs adat a csataterekről.</div>
                )}
            </div>
        </div>
    );
}

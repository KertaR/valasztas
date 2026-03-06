import { Percent, AlertCircle } from 'lucide-react';

export default function CalculatorControls({
    votes,
    handleVoteChange,
    fractionalBonus,
    setFractionalBonus,
    totalVotePercent
}) {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-8 flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <Percent className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    Országos Listás Szavazatarányok
                </h3>
                <div className="flex items-center gap-3 font-bold text-sm bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    Összesített:
                    <span className={`text-lg font-black ${totalVotePercent === 100 ? 'text-emerald-500' : 'text-red-500 flex items-center gap-1.5'}`}>
                        {totalVotePercent !== 100 && <AlertCircle className="w-5 h-5" />}
                        {totalVotePercent}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {[
                    { id: 'fidesz', label: 'FIDESZ-KDNP', color: 'orange-500', baseColor: '#f97316' },
                    { id: 'tisza', label: 'TISZA', color: 'cyan-500', baseColor: '#06b6d4' },
                    { id: 'dk', label: 'Demokratikus Koalíció', color: 'blue-500', baseColor: '#3b82f6' },
                    { id: 'mhm', label: 'Mi Hazánk', color: 'emerald-500', baseColor: '#10b981' },
                    { id: 'egyhat', label: 'Egyéb párt (5% felett)', color: 'purple-500', baseColor: '#a855f7' },
                    { id: 'egyeb', label: 'Egyéb pártok (elvesző)', color: 'slate-500', baseColor: '#64748b' }
                ].map((party) => (
                    <div key={party.id} className="group relative p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-20" style={{ backgroundColor: party.baseColor }}></div>
                        <div className="flex justify-between items-center mb-5 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full shadow-sm border border-white/20" style={{ backgroundColor: party.baseColor }}></div>
                                <span className="text-base font-black text-slate-700 dark:text-slate-200">{party.label}</span>
                            </div>
                            <span className={`text-xl font-black px-3 py-1 rounded-xl text-${party.color} bg-${party.color}/10 border border-${party.color}/20 min-w-[3.5rem] text-center`}>
                                {votes[party.id]}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0" max="100"
                            value={votes[party.id]}
                            onChange={(e) => handleVoteChange(party.id, e.target.value)}
                            className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full appearance-none cursor-pointer relative z-10 shadow-inner"
                            style={{ accentColor: party.baseColor }}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Győzteskompenzációarány (%)</span>
                    <span className="text-sm font-black px-2 py-0.5 rounded-lg border dark:border-slate-800 text-indigo-500 bg-indigo-500/10 border-indigo-500/20">
                        +{fractionalBonus}%
                    </span>
                </div>
                <input
                    type="range"
                    min="0" max="30"
                    value={fractionalBonus}
                    onChange={(e) => setFractionalBonus(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:accent-indigo-400"
                />
                <p className="text-[10px] text-slate-500 mt-2 leading-tight">Az OEVK győztese megkapja saját töredékszavazatait. Ez a súlyozó a győztes felülreprezentációját/bónuszát adja hozzá a listás D'Hondt számításhoz virtuálisan.</p>
            </div>
        </div>
    );
}

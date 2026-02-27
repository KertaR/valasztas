import { Map, Users } from 'lucide-react';

export default function DistrictCard({ dist, onSelect }) {
    return (
        <div
            onClick={() => onSelect(dist)}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-5 hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 dark:opacity-5 dark:group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
                <Map className="w-24 h-24 text-blue-800 dark:text-blue-200" />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight pr-4 text-base md:text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {dist.evk_nev}
                    </h3>
                </div>
                <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-2.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-bold text-blue-800 dark:text-blue-300">{dist.candidateCount} regisztrált jelölt</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
                        <div>
                            <span className="block text-slate-400 dark:text-slate-500 text-[10px] md:text-xs uppercase tracking-wider font-bold mb-0.5">Kód</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                                {dist.maz}-{dist.evk}
                            </span>
                        </div>
                        <div>
                            <span className="block text-slate-400 dark:text-slate-500 text-[10px] md:text-xs uppercase tracking-wider font-bold mb-0.5">Székhely</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block pr-2" title={dist.szekhely}>
                                {dist.szekhely}
                            </span>
                        </div>
                        <div className="col-span-2 mt-1">
                            <span className="block text-slate-400 dark:text-slate-500 text-[10px] md:text-xs uppercase tracking-wider font-bold mb-0.5">Választók (ind.)</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                {dist.letszam?.indulo ? dist.letszam.indulo.toLocaleString('hu-HU') : 'N/A'} fő
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

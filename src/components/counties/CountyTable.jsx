import { MapPin } from 'lucide-react';

export default function CountyTable({ data, onSelect }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] transition-colors">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 transition-colors">
                        <tr>
                            <th className="p-4 font-semibold">Vármegye Neve</th>
                            <th className="p-4 font-semibold text-center">Kerületek (OEVK)</th>
                            <th className="p-4 font-semibold text-right">Összes Választó</th>
                            <th className="p-4 font-semibold text-right">Összes Jelölt</th>
                            <th className="p-4 font-semibold text-right">Átlag Jelölt / OEVK</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                        {data.map((county, idx) => {
                            const avgCandidates = county.oevkCount > 0
                                ? (county.candidateCount / county.oevkCount).toFixed(1)
                                : 0;
                            return (
                                <tr
                                    key={idx}
                                    onClick={() => onSelect(county)}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                >
                                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors">
                                        <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 transition-colors" />
                                        {county.nev}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                                            {county.oevkCount}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-medium text-slate-600 dark:text-slate-400 transition-colors">
                                        {county.voterCount.toLocaleString('hu-HU')}
                                    </td>
                                    <td className="p-4 text-right transition-colors">
                                        <span className="font-bold text-blue-700 dark:text-blue-400">
                                            {county.candidateCount}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right transition-colors">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm border transition-colors ${avgCandidates >= 5 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'}`}>
                                            {avgCandidates} fő
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

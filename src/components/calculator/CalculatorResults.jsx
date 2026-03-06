import { Calculator, AlertCircle } from 'lucide-react';

export default function CalculatorResults({ mandates }) {
    return (
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
            {/* Results Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex-1">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-indigo-500" />
                        Mandátum Kiosztás
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                            <tr>
                                <th className="p-4">Párt / Pártszöv.</th>
                                <th className="p-4 text-center">OEVK</th>
                                <th className="p-4 text-center">Listás</th>
                                <th className="p-4 text-center text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50">Össz</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {mandates.sort((a, b) => b.total - a.total).map((party) => (
                                <tr key={party.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: party.color }}></div>
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[100px] sm:max-w-none" title={party.name}>{party.name}</span>
                                            {party.vote < 5 && party.name !== "Egyéb pártok (elvesző)" && (
                                                <span className="text-[9px] font-black uppercase text-red-500 border border-red-500/30 bg-red-500/10 px-1 py-0.5 rounded-md hidden sm:inline-block">5% alatt</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-500 dark:text-slate-400 text-sm">
                                        {party.vote < 5 ? '-' : party.oevk}
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-500 dark:text-slate-400 text-sm">
                                        {party.vote < 5 ? '-' : party.list}
                                    </td>
                                    <td className="p-4 text-center font-black text-base text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                                        {party.vote < 5 ? '0' : party.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Methodology Info Box */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border border-indigo-100/50 dark:border-indigo-800/30 p-6 rounded-[2rem] shadow-sm">
                <h4 className="font-black text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4" />
                    Modell Módszertana
                </h4>
                <div className="text-indigo-900/70 dark:text-indigo-200/70 text-xs font-semibold space-y-2.5 leading-relaxed">
                    <p><strong>1. Parlament:</strong> A magyar országgyűlés 199 fős (106 OEVK + 93 lista).</p>
                    <p><strong>2. Küszöb:</strong> Az 5%-ot nem elérő pártok elveszítik a listás és az OEVK esélyeiket is.</p>
                    <p><strong>3. Végletesedő OEVK:</strong> Az egyéni körzeteket egy brit stílusú (First Past The Post) szimulátor osztja ki.</p>
                    <p><strong>4. Kompenzáció:</strong> A listás helyek D'Hondt-mátrixszal és törttöredék-szavazat kompenzációval készülnek.</p>
                </div>
            </div>

        </div>
    );
}

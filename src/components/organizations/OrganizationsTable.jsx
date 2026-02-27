import { Building2, Zap } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

export default function OrganizationsTable({ organizations, onSelect }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] transition-colors">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 transition-colors">
                        <tr>
                            <th className="p-4 font-semibold">Szervezet Neve</th>
                            <th className="p-4 font-semibold">Rövidítés</th>
                            <th className="p-4 font-semibold">OEVK Lefedettség</th>
                            <th className="p-4 font-semibold text-right">Indított Jelöltek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                        {organizations.map((org, idx) => (
                            <tr
                                key={org.szkod || idx}
                                onClick={() => onSelect(org)}
                                className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group"
                            >
                                <td className="p-4 font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-3">
                                    {org.emblema ? (
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1">
                                            <img
                                                src={getImageUrl(org.emblema)}
                                                alt={org.r_nev || org.nev}
                                                crossOrigin="anonymous"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'block';
                                                }}
                                            />
                                            <Building2 className="w-5 h-5 text-slate-400 dark:text-slate-500 hidden group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 transition-colors">
                                            <Building2 className="w-4 h-4 md:w-5 md:h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="line-clamp-2 md:line-clamp-none leading-tight">{org.coalitionFullName || org.nev}</span>
                                            {org.isNew && (
                                                <span className="flex items-center gap-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ring-1 ring-amber-200 dark:ring-amber-500/30 animate-pulse flex-shrink-0 transition-colors">
                                                    <Zap className="w-2.5 h-2.5" /> ÚJ
                                                </span>
                                            )}
                                        </div>
                                        {org.alliances && org.alliances.length > 0 && !org.isCoalitionMain && (
                                            <div className="flex items-center gap-1 mt-1 transition-colors">
                                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Szövetség:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {org.alliances.slice(0, 2).map((a, i) => (
                                                        <span key={i} className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded border border-indigo-100 dark:border-indigo-800/50 transition-colors">
                                                            {a.abbr}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300 transition-colors">
                                    {(org.coalitionAbbr || org.r_nev) && (
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-600/50 whitespace-nowrap transition-colors">
                                            {org.coalitionAbbr || org.r_nev}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 align-middle">
                                    <div className="flex flex-col gap-2 w-full max-w-[200px]">
                                        <div className="flex justify-between items-center text-[11px] font-bold">
                                            <div className="flex gap-2.5">
                                                <span className="flex items-center gap-1.5 opacity-90 text-emerald-700 dark:text-emerald-500" title="Jogerős nyilvántartásba vétel">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_4px_rgba(5,150,105,0.8)]"></span>
                                                    {org.registeredFinalOevkCoverage}
                                                </span>
                                                {(org.registeredOevkCoverage - org.registeredFinalOevkCoverage) > 0 && (
                                                    <span className="flex items-center gap-1.5 text-emerald-600/70 dark:text-emerald-400/80" title="Nem jogerős">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        {org.registeredOevkCoverage - org.registeredFinalOevkCoverage}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500" title="Összes induló">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/30"></span>
                                                    {org.oevkCoverage}
                                                </span>
                                            </div>
                                            <span className="text-emerald-700 dark:text-emerald-400/90 font-black">{org.registeredFinalCoveragePercent}%</span>
                                        </div>

                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                            <div
                                                className="absolute h-full bg-indigo-500/20 transition-all duration-500"
                                                style={{ width: `${org.coveragePercent}%` }}
                                            ></div>
                                            <div
                                                className="absolute h-full bg-emerald-400/80 transition-all duration-700 delay-100"
                                                style={{ width: `${org.registeredCoveragePercent}%` }}
                                            ></div>
                                            <div
                                                className="absolute h-full bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.8)] transition-all duration-700 delay-200"
                                                style={{ width: `${org.registeredFinalCoveragePercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm border whitespace-nowrap transition-colors ${org.registeredFinalOevkCoverage > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                            {org.registeredFinalOevkCoverage} jogerős
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 transition-colors">
                                            {org.candidateCount} összesen
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {organizations.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                        <Building2 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Nem található jelölő szervezet.</p>
                </div>
            )}
        </div>
    );
}

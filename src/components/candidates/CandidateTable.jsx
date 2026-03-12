import { Zap } from 'lucide-react';
import Highlighter from 'react-highlight-words';
import { StatusBadge } from '../ui';
import { getInitials, getImageUrl } from '../../utils/helpers';

export default function CandidateTable({
    candidates,
    searchTerm,
    handleSort,
    getSortIcon,
    setSelectedCandidate
}) {
    return (
        <table className="w-full text-left border-collapse bg-transparent transition-colors">
            <thead className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-500 dark:text-slate-400 sticky top-0 z-10 text-xs uppercase tracking-widest font-black transition-colors shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
                <tr>
                    <th className="p-4 border-b border-white/50 dark:border-slate-700/50 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group" onClick={() => handleSort('neve')}>
                        <div className="flex items-center gap-1 md:gap-2">Jelölt neve {getSortIcon('neve')}</div>
                    </th>
                    <th className="p-4 border-b border-white/50 dark:border-slate-700/50 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group hidden md:table-cell" onClick={() => handleSort('districtName')}>
                        <div className="flex items-center gap-2">Választókerület {getSortIcon('districtName')}</div>
                    </th>
                    <th className="p-4 border-b border-white/50 dark:border-slate-700/50 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group hidden sm:table-cell" onClick={() => handleSort('partyNames')}>
                        <div className="flex items-center gap-2">Szervezet {getSortIcon('partyNames')}</div>
                    </th>
                    <th className="p-4 border-b border-white/50 dark:border-slate-700/50 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group" onClick={() => handleSort('allapot_valt')}>
                        <div className="flex items-center gap-1 md:gap-2">Legutóbbi Változás {getSortIcon('allapot_valt')}</div>
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/40">
                {candidates.map((jelolt, idx) => (
                    <tr key={jelolt.ej_id || idx} onClick={() => setSelectedCandidate(jelolt)} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 cursor-pointer group hover:shadow-[inset_0_0_20px_rgba(79,70,229,0.05)] relative z-0 hover:z-10">
                        <td className="p-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100/80 to-blue-50/80 dark:from-indigo-900/40 dark:to-blue-900/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm md:text-base shadow-sm border border-white/60 dark:border-slate-700/50 flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all duration-300 relative">
                                    {jelolt.fenykep ? (
                                        <img
                                            src={getImageUrl(jelolt.fenykep)}
                                            alt={jelolt.neve}
                                            crossOrigin="anonymous"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center ${jelolt.fenykep ? 'hidden' : ''}`}>
                                        {getInitials(jelolt.neve)}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-black text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                        <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.neve} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                                        {jelolt.isNew && <span className="flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse"><Zap className="w-2.5 h-2.5" fill="currentColor" /> ÚJ</span>}
                                    </div>
                                    <div className="md:hidden text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                        <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.districtName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                                    </div>
                                    <div className="sm:hidden text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[170px] uppercase tracking-wider">
                                        <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.partyNames} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                            <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-0.5">
                                <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.countyName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.districtName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                            </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 max-w-[180px] md:max-w-[250px] truncate shadow-sm">
                                <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.partyNames} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col gap-1.5 items-start">
                                <StatusBadge status={jelolt.statusName} />
                                <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{jelolt.allapot_valt ? new Date(jelolt.allapot_valt).toLocaleDateString('hu-HU') : ''}</span>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

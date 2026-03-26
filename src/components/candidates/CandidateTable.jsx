import React, { useRef, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Zap } from 'lucide-react';
import Highlighter from 'react-highlight-words';
import { StatusBadge } from '../ui';
import { getInitials, getImageUrl } from '../../utils/helpers';

/**
 * @param {Object} props
 * @param {number} props.index
 * @param {React.CSSProperties} props.style
 * @param {Object} props.data
 * @param {import('../../types/app').EnrichedCandidate[]} props.data.candidates
 * @param {string} props.data.searchTerm
 * @param {(c: import('../../types/app').EnrichedCandidate) => void} props.data.setSelectedCandidate
 */
const Row = ({ index, style, data }) => {
    const { candidates, searchTerm, setSelectedCandidate } = data;
    /** @type {import('../../types/app').EnrichedCandidate} */
    const jelolt = candidates[index];

    return (
        <div
            style={style}
            onClick={() => setSelectedCandidate(jelolt)}
            data-testid="candidate-row"
            className="flex items-center hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 cursor-pointer group border-b border-slate-200/30 dark:divide-slate-800/40"
        >
            <div className="flex-1 min-w-0 p-4 flex items-center gap-3 md:gap-4">
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
                <div className="truncate">
                    <div className="font-black text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.neve} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                        {jelolt.isNew && <span className="flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse"><Zap className="w-2.5 h-2.5" fill="currentColor" /> ÚJ</span>}
                    </div>
                    <div className="md:hidden text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.districtName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                    </div>
                </div>
            </div>

            <div className="hidden md:flex flex-col flex-1 p-4">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-0.5">
                    <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.countyName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                </div>
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.districtName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                </div>
            </div>

            <div className="hidden sm:flex flex-1 p-4 items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 truncate shadow-sm">
                    <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.partyNames} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                </span>
            </div>

            <div className="w-[140px] md:w-[180px] p-4 flex flex-col gap-1.5 items-start justify-center flex-shrink-0">
                <StatusBadge status={jelolt.statusName} />
                <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{jelolt.allapot_valt ? new Date(jelolt.allapot_valt).toLocaleDateString('hu-HU') : ''}</span>
            </div>
        </div>
    );
};

export default function CandidateTable({
    candidates,
    searchTerm,
    handleSort,
    getSortIcon,
    setSelectedCandidate
}) {
    const listRef = useRef();

    const itemData = useMemo(() => ({
        candidates,
        searchTerm,
        setSelectedCandidate
    }), [candidates, searchTerm, setSelectedCandidate]);

    return (
        <div className="w-full flex flex-col h-full min-w-[600px]">
            {/* Header */}
            <div
                data-testid="candidate-table-header"
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-500 dark:text-slate-400 z-10 text-xs uppercase tracking-widest font-black transition-colors shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex border-b border-slate-200/50 dark:border-slate-700/50"
            >
                <div className="flex-1 p-4 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group" onClick={() => handleSort('neve')}>
                    <div className="flex items-center gap-1 md:gap-2">Jelölt neve {getSortIcon('neve')}</div>
                </div>
                <div className="flex-1 p-4 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group hidden md:block" onClick={() => handleSort('districtName')}>
                    <div className="flex items-center gap-2">Választókerület {getSortIcon('districtName')}</div>
                </div>
                <div className="flex-1 p-4 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group hidden sm:block" onClick={() => handleSort('partyNames')}>
                    <div className="flex items-center gap-2">Szervezet {getSortIcon('partyNames')}</div>
                </div>
                <div className="w-[140px] md:w-[180px] p-4 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-slate-700/30 transition-colors group flex-shrink-0" onClick={() => handleSort('allapot_valt')}>
                    <div className="flex items-center gap-1 md:gap-2">Változás {getSortIcon('allapot_valt')}</div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1">
                <List
                    height={600} // This will be overridden by CSS or parent resize handler in a real scenario
                    itemCount={candidates.length}
                    itemSize={80} // Approx row height
                    width="100%"
                    itemData={itemData}
                    ref={listRef}
                    className="custom-scrollbar"
                >
                    {Row}
                </List>
            </div>
        </div>
    );
}

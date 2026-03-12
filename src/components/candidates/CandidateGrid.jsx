import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin } from 'lucide-react';
import Highlighter from 'react-highlight-words';
import { StatusBadge } from '../ui';
import { getInitials, getImageUrl } from '../../utils/helpers';

export default function CandidateGrid({
    candidates,
    searchTerm,
    setSelectedCandidate
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 p-2 pb-6">
            <AnimatePresence mode="popLayout">
                {candidates.map((jelolt, idx) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={jelolt.ej_id || idx}
                        onClick={() => setSelectedCandidate(jelolt)}
                        className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] shadow-lg hover:shadow-2xl border border-white/50 dark:border-slate-800/80 p-5 cursor-pointer group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
                    >
                        {/* Decorative background element for the card */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[40px] group-hover:bg-blue-400/20 dark:group-hover:bg-blue-400/30 transition-all duration-500"></div>

                        <div className="flex justify-between items-start gap-4 mb-5 relative z-10">
                            <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xl shadow-md border border-white/50 dark:border-slate-700/50 group-hover:scale-105 group-hover:shadow-lg transition-transform relative">
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
                            <div className="flex flex-col items-end gap-2 min-w-0 flex-1">
                                <div className="max-w-full flex justify-end">
                                    <StatusBadge status={jelolt.statusName} />
                                </div>
                                {jelolt.isNew && <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-sm shadow-amber-500/30 animate-pulse ring-2 ring-white dark:ring-slate-900">ÚJ</span>}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col relative z-10">
                            <h3 className="font-black text-slate-800 dark:text-slate-100 text-[19px] leading-tight mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.neve} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                            </h3>

                            <div className="mt-auto space-y-3">
                                <div className="flex items-start gap-2.5 bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-white/40 dark:border-slate-800/60 shadow-inner">
                                    <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight">
                                        <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.partyNames} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5 px-1 pb-1">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                                    <div className="line-clamp-2 leading-tight">
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 block pb-0.5">
                                            <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.countyName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-500">
                                            <Highlighter searchWords={[searchTerm]} autoEscape={true} textToHighlight={jelolt.districtName} highlightClassName="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 px-0.5 rounded" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateSearch({ value, onChange, candidates, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search) return candidates.slice(0, 50);
        const lowerSearch = search.toLowerCase();
        return candidates.filter(c =>
            c.neve.toLowerCase().includes(lowerSearch) ||
            c.partyNames.toLowerCase().includes(lowerSearch)
        ).slice(0, 50);
    }, [candidates, search]);

    return (
        <div className="relative">
            {value ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold transition-colors">
                            {value.neve.split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{value.neve}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] transition-colors">{value.partyNames}</div>
                        </div>
                    </div>
                    <button onClick={() => { onChange(null); setSearch(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                    <AnimatePresence>
                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden max-h-[300px] overflow-y-auto transition-colors"
                                >
                                    {filtered.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Nincs találat</div>
                                    ) : (
                                        filtered.map(c => (
                                            <div
                                                key={c.szj}
                                                onClick={() => { onChange(c); setIsOpen(false); }}
                                                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-slate-100">{c.neve}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{c.districtName}</div>
                                                </div>
                                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded max-w-[120px] truncate">
                                                    {c.partyNames}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

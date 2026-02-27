import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrgSearch({ value, onChange, organizations, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let baseList = organizations.filter(o => !o.isCoalitionPartner);
        if (!search) return baseList.slice(0, 50);
        const lowerSearch = search.toLowerCase();
        return baseList.filter(o =>
            (o.nev && o.nev.toLowerCase().includes(lowerSearch)) ||
            (o.r_nev && o.r_nev.toLowerCase().includes(lowerSearch)) ||
            (o.coalitionFullName && o.coalitionFullName.toLowerCase().includes(lowerSearch)) ||
            (o.coalitionAbbr && o.coalitionAbbr.toLowerCase().includes(lowerSearch))
        ).slice(0, 50);
    }, [organizations, search]);

    return (
        <div className="relative">
            {value ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold transition-colors">
                            {(value.coalitionAbbr || value.r_nev || '??').substring(0, 3)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{value.coalitionFullName || value.nev}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] transition-colors">{value.coalitionAbbr || value.r_nev}</div>
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
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-800 dark:text-slate-100 transition-colors"
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
                                        filtered.map(o => (
                                            <div
                                                key={o.szkod}
                                                onClick={() => { onChange(o); setIsOpen(false); }}
                                                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                                            >
                                                <div className="font-bold text-slate-800 dark:text-slate-100">{o.coalitionFullName || o.nev}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{o.coalitionAbbr || o.r_nev}</div>
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

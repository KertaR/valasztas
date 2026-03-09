import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchInput({
    value,
    onChange,
    items,
    placeholder,
    filterFn,
    renderSelected,
    renderItem,
    itemKey,
    colorClass = "blue" // "blue" or "indigo" supported initially
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search) return items.slice(0, 50);
        return items.filter(item => filterFn(item, search)).slice(0, 50);
    }, [items, search, filterFn]);

    const borderFocusClass = colorClass === "indigo" ? "focus:border-indigo-500 dark:focus:border-indigo-500" : "focus:border-blue-500 dark:focus:border-blue-500";

    return (
        <div className="relative">
            {value ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm transition-colors">
                    {renderSelected(value)}
                    <button onClick={() => { onChange(null); setSearch(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors ml-3 flex-shrink-0">
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
                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:outline-none ${borderFocusClass} text-slate-800 dark:text-slate-100 transition-colors`}
                    />
                    <AnimatePresence>
                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar transition-colors"
                                >
                                    {filtered.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Nincs találat</div>
                                    ) : (
                                        filtered.map(item => (
                                            <div
                                                key={itemKey(item)}
                                                onClick={() => { onChange(item); setIsOpen(false); }}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                                            >
                                                {renderItem(item)}
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

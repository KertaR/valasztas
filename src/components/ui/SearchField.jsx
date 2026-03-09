import React from 'react';
import { Search } from 'lucide-react';

export default function SearchField({ value, onChange, placeholder = "Keresés...", className = "", inputClassName = "" }) {
    return (
        <div className={`relative group ${className}`}>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 ${inputClassName}`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
        </div>
    );
}

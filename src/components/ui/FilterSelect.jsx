import React from 'react';
import { Filter } from 'lucide-react';

export default function FilterSelect({
    value,
    onChange,
    options,
    defaultOptionLabel = "Összes",
    icon: Icon = Filter,
    className = "",
    selectClassName = ""
}) {
    return (
        <div className={`relative group ${className}`}>
            {Icon && <Icon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors pointer-events-none" />}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-8 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800 ${selectClassName}`}
            >
                <option value="">{defaultOptionLabel}</option>
                {options.map(opt => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const label = typeof opt === 'object' ? opt.label : opt;
                    return (
                        <option key={val} value={val}>
                            {label}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

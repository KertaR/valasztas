import React from 'react';
import { SearchInput } from '../ui';

export default function OrgSearch({ value, onChange, organizations, placeholder }) {
    return (
        <SearchInput
            value={value}
            onChange={onChange}
            items={organizations}
            placeholder={placeholder}
            colorClass="indigo"
            itemKey={o => o.szkod || o.nev}
            filterFn={(o, search) => {
                if (o.isCoalitionPartner) return false;
                const q = search.toLowerCase();
                return (o.nev && o.nev.toLowerCase().includes(q)) ||
                    (o.r_nev && o.r_nev.toLowerCase().includes(q)) ||
                    (o.coalitionFullName && o.coalitionFullName.toLowerCase().includes(q)) ||
                    (o.coalitionAbbr && o.coalitionAbbr.toLowerCase().includes(q));
            }}
            renderSelected={o => (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold transition-colors flex-shrink-0">
                        {(o.coalitionAbbr || o.r_nev || '??').substring(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-100 transition-colors truncate">{o.coalitionFullName || o.nev}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">{o.coalitionAbbr || o.r_nev}</div>
                    </div>
                </div>
            )}
            renderItem={o => (
                <div className="p-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{o.coalitionFullName || o.nev}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{o.coalitionAbbr || o.r_nev}</div>
                </div>
            )}
        />
    );
}

import React from 'react';
import { SearchInput } from '../ui';

export default function CandidateSearch({ value, onChange, candidates, placeholder }) {
    return (
        <SearchInput
            value={value}
            onChange={onChange}
            items={candidates}
            placeholder={placeholder}
            colorClass="blue"
            itemKey={c => c.szj || c.nemzeti_azonosito || c.neve}
            filterFn={(c, search) => {
                const q = search.toLowerCase();
                return c.neve.toLowerCase().includes(q) || c.partyNames.toLowerCase().includes(q);
            }}
            renderSelected={c => (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold transition-colors flex-shrink-0">
                        {c.neve.split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-100 transition-colors truncate">{c.neve}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">{c.partyNames}</div>
                    </div>
                </div>
            )}
            renderItem={c => (
                <div className="p-3 flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{c.neve}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.districtName}</div>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded max-w-[120px] truncate flex-shrink-0">
                        {c.partyNames}
                    </div>
                </div>
            )}
        />
    );
}

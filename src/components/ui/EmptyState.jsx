import React from 'react';

export default function EmptyState({ icon: Icon, text }) {
    return (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            {Icon && (
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-8 h-8 text-slate-300" />
                </div>
            )}
            <p className="text-slate-500 dark:text-slate-400 font-medium">{text}</p>
        </div>
    );
}

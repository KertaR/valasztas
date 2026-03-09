import React from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function ExportButton({ onClick, isExporting, text = "Exportálás", loadingText = "Mentés..." }) {
    return (
        <button
            onClick={onClick}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300 hover:bg-slate-700 dark:hover:bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
        >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">{isExporting ? loadingText : text}</span>
        </button>
    );
}

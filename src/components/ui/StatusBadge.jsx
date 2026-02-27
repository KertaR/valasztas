export default function StatusBadge({ status }) {
    let colorClass = "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

    if (status.includes('visszautasítva') && status.includes('nem jogerős')) {
        colorClass = "bg-red-200 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800";
    } else if (status.includes('visszautasítva')) {
        colorClass = "bg-red-700 dark:bg-red-950 text-white dark:text-red-200 border-red-800 dark:border-red-900";
    } else if (status.includes('Nyilvántartásba')) {
        colorClass = "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
    } else if (status.includes('törölve') || status.includes('elutasítva')) {
        colorClass = "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50";
    } else if (status.includes('átvette') || status.includes('Bejelentve')) {
        colorClass = "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
    }

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold shadow-sm border ${colorClass} max-w-full truncate block transition-colors`}
            title={status}
        >
            {status}
        </span>
    );
}

export default function NavItem({ icon, label, active, onClick, badge }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all font-bold ${active ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}>
            <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
            {badge !== undefined && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{badge}</span>}
        </button>
    );
}

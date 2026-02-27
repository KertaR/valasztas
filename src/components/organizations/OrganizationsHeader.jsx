import { Zap } from 'lucide-react';

export default function OrganizationsHeader({ showOnlyNew, setShowOnlyNew }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white transition-colors">Jelölő Szervezetek</h1>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium transition-colors">A táblázat mutatja a pártok **országos lefedettségét** is (106 OEVK-ra vetítve).</p>
            </div>
            <button
                onClick={() => setShowOnlyNew(!showOnlyNew)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${showOnlyNew ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <Zap className={`w-4 h-4 ${showOnlyNew ? 'fill-current' : 'text-amber-500'}`} />
                {showOnlyNew ? 'Minden szervezet mutatása' : 'Csak az új szervezetek'}
            </button>
        </div>
    );
}

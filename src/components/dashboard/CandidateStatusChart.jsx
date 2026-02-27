import { ResponsiveContainer, PieChart, Pie, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { FileText } from 'lucide-react';

export default function CandidateStatusChart({ statusCategories, statusBreakdown, onStatusClick }) {
    const totalCount = Object.values(statusCategories).reduce((a, b) => a + b, 0);

    const pieData = [
        { name: 'Nyilvántartásba véve', value: statusCategories.registered, color: '#14532d' },
        { name: 'Nyilvántartásba véve (nem jogerős)', value: statusCategories.registered_pre, color: '#86efac' },
        { name: 'Folyamatban', value: statusCategories.pending, color: '#60a5fa' },
        { name: 'Nem kíván indulni', value: statusCategories.not_starting, color: '#94a3b8' },
        { name: 'Törölve/Elutasítva', value: statusCategories.deleted, color: '#ef4444' },
        { name: 'Visszautasítva (nem jogerős)', value: statusCategories.visszautasitva_pre, color: '#fca5a5' },
        { name: 'Visszautasítva', value: statusCategories.visszautasitva_final, color: '#991b1b' }
    ].filter(d => d.value > 0);

    const colors = {
        registered: '#14532d',
        registered_pre: '#86efac',
        pending: '#60a5fa',
        not_starting: '#94a3b8',
        deleted: '#ef4444',
        visszautasitva_pre: '#fca5a5',
        visszautasitva_final: '#991b1b'
    };

    const textColors = {
        registered: 'text-green-900 dark:text-green-500',
        registered_pre: 'text-green-600 dark:text-green-400',
        pending: 'text-blue-600 dark:text-blue-400',
        not_starting: 'text-slate-500 dark:text-slate-400',
        deleted: 'text-red-500 dark:text-red-400',
        visszautasitva_pre: 'text-red-400 dark:text-red-300',
        visszautasitva_final: 'text-red-800 dark:text-red-600'
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                Feldolgozottság Állapota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-64 flex justify-center items-center relative" style={{ minHeight: '256px', minWidth: '0' }}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={250} minWidth={0} debounce={50}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="transparent"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        onClick={() => onStatusClick && onStatusClick(entry.name)}
                                        className={onStatusClick ? "cursor-pointer hover:opacity-80 transition-opacity outline-none" : "outline-none"}
                                        style={{ outline: 'none' }}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', fontWeight: 'bold' }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-800 dark:text-white">{totalCount}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider text-center">Összes<br />bejelentés</span>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-6">
                    <div className="w-full h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden shadow-inner flex-shrink-0">
                        <div className="bg-[#14532d] h-full transition-all duration-1000" style={{ width: `${(statusCategories.registered / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="bg-[#86efac] h-full transition-all duration-1000" style={{ width: `${(statusCategories.registered_pre / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="bg-[#60a5fa] h-full transition-all duration-1000" style={{ width: `${(statusCategories.pending / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="bg-[#94a3b8] h-full transition-all duration-1000" style={{ width: `${(statusCategories.not_starting / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="bg-[#ef4444] h-full transition-all duration-1000" style={{ width: `${(statusCategories.deleted / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="bg-[#fca5a5] h-full transition-all duration-1000" style={{ width: `${(statusCategories.visszautasitva_pre / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="bg-[#991b1b] h-full transition-all duration-1000" style={{ width: `${(statusCategories.visszautasitva_final / Math.max(1, totalCount)) * 100}%` }}></div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 lg:p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                        {statusBreakdown.filter(s => s.count > 0).map((status, idx) => (
                            <div
                                key={idx}
                                onClick={() => onStatusClick && onStatusClick(status.name)}
                                className={`flex items-center justify-between group p-2 rounded-lg transition-all ${onStatusClick ? 'cursor-pointer hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.98]' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: colors[status.type] || '#cbd5e1' }}></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] md:text-xs transition-colors truncate max-w-[150px] md:max-w-none group-hover:text-blue-600 dark:group-hover:text-blue-400">{status.name}</span>
                                </div>
                                <span className={`font-black text-sm transition-colors ${textColors[status.type] || 'text-slate-500'} group-hover:scale-110 transform`}>{status.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

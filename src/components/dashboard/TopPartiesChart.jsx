import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { BarChart } from 'lucide-react';

export default function TopPartiesChart({ organizations }) {
    const data = organizations
        .filter(org => !org.isCoalitionPartner)
        .slice(0, 10)
        .map(org => ({
            name: org.coalitionAbbr || org.r_nev || (org.nev.length > 20 ? org.nev.substring(0, 18) + '...' : org.nev),
            registeredFinal: org.registeredFinalCount || 0,
            registeredPre: org.registeredPreCount || 0,
            pending: org.candidateCount - (org.registeredFinalCount || 0) - (org.registeredPreCount || 0),
            total: org.candidateCount
        }));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    Legtöbb jelöltet indító szervezetek (Top 10)
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-700 dark:bg-emerald-600"></div><span className="text-emerald-700 dark:text-emerald-500">Jogerős</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-300"></div><span className="text-emerald-500 dark:text-emerald-400">Nem jogerős</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500/30"></div><span className="text-slate-400">Folyamatban</span></div>
                </div>
            </div>
            <div className="h-80 w-full" style={{ minHeight: '320px', minWidth: '0' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0} debounce={50}>
                    <RechartsBarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" opacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                            cursor={{ fill: 'rgba(235, 248, 255, 0.4)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', fontWeight: 'bold', fontSize: '12px' }}
                            formatter={(value, name) => [value, name === 'registeredFinal' ? 'Jogerős' : name === 'registeredPre' ? 'Nem jogerős' : 'Folyamatban']}
                        />
                        <Bar dataKey="registeredFinal" stackId="a" fill="#047857" radius={[0, 0, 0, 0]} barSize={18} />
                        <Bar dataKey="registeredPre" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={18} />
                        <Bar dataKey="pending" stackId="a" fill="#3b82f6" fillOpacity={0.3} radius={[0, 4, 4, 0]} barSize={18} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

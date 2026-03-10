import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LabelList, Cell } from 'recharts';
import { BarChart, Building2, Users } from 'lucide-react';
import { useState } from 'react';

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

    const [activeIndex, setActiveIndex] = useState(null);

    // Custom Tooltip a frosted-glass üveghatásért
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                        <p className="font-black text-slate-800 dark:text-white">{label}</p>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-700"></div><span className="text-slate-600 dark:text-slate-300">Jogerős</span></div>
                            <span className="text-emerald-700 dark:text-emerald-400 font-black">{data.registeredFinal}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="text-slate-600 dark:text-slate-300">Nem jogerős</span></div>
                            <span className="text-emerald-500 dark:text-emerald-300 font-black">{data.registeredPre}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 mt-1 mb-1"></div><span className="text-slate-600 dark:text-slate-300">Folyamatban</span></div>
                            <span className="text-blue-500 dark:text-blue-400 font-black">{data.pending}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Összesen</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {data.total}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 dark:border-slate-800/80 p-5 md:p-6 transition-colors">
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
                        <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />

                        <Bar
                            dataKey="registeredFinal"
                            stackId="a"
                            radius={[0, 0, 0, 0]}
                            barSize={20}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-1-${index}`} fill={activeIndex === index ? '#065f46' : '#047857'} className="transition-all duration-300 cursor-pointer" style={activeIndex === index ? { filter: 'drop-shadow(0 0 6px rgba(4,120,87,0.6))' } : {}} />
                            ))}
                        </Bar>

                        <Bar
                            dataKey="registeredPre"
                            stackId="a"
                            radius={[0, 0, 0, 0]}
                            barSize={20}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-2-${index}`} fill={activeIndex === index ? '#10b981' : '#34d399'} className="transition-all duration-300 cursor-pointer" style={activeIndex === index ? { filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.6))' } : {}} />
                            ))}
                        </Bar>

                        <Bar
                            dataKey="pending"
                            stackId="a"
                            radius={[0, 6, 6, 0]}
                            barSize={20}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-3-${index}`} fill={activeIndex === index ? '#2563eb' : '#3b82f6'} fillOpacity={activeIndex === index ? 0.6 : 0.3} className="transition-all duration-300 cursor-pointer" style={activeIndex === index ? { filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' } : {}} />
                            ))}
                            <LabelList
                                dataKey="total"
                                position="right"
                                fill="#64748b"
                                className="font-extrabold text-xs dark:fill-slate-400"
                                offset={10}
                            />
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

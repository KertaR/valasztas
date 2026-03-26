import React, { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, ChartErrorBoundary } from '../ui';
import { Trophy } from 'lucide-react';

const TopPartiesChart = React.memo(({ organizations }) => {
    /** @type {React.MutableRefObject<HTMLDivElement | null>} */
    const chartRef = useRef(null);
    /** @type {[number | null, React.Dispatch<React.SetStateAction<number | null>>]} */
    const [activeIndex, setActiveIndex] = useState(null);

    /** @type {Array<{name: string, registeredFinal: number, registeredPre: number, pending: number, total: number}>} */
    const data = useMemo(() => (organizations || [])
        .filter(/** @param {import('../../types/app').EnrichedOrganization} org */ org => !org.isCoalitionPartner)
        .slice(0, 10)
        .map(/** @param {import('../../types/app').EnrichedOrganization} org */ org => ({
            name: org.coalitionAbbr || org.r_nev || (org.nev.length > 20 ? org.nev.substring(0, 18) + '...' : org.nev),
            registeredFinal: org.registeredFinalCount || 0,
            registeredPre: org.registeredPreCount || 0,
            pending: (org.candidateCount || 0) - (org.registeredFinalCount || 0) - (org.registeredPreCount || 0),
            total: org.candidateCount || 0
        })), [organizations]);

    // Custom Tooltip a frosted-glass üveghatásért
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                        <Trophy className="w-4 h-4 text-indigo-500" />
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
                            <Trophy className="w-3.5 h-3.5" />
                            {data.total}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">TOP 10 Szervezet</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Jelöltállítási rangsor</p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <Trophy className="w-5 h-5" />
                </div>
            </div>

            <div className="w-full relative h-[450px]" ref={chartRef}>
                <ChartErrorBoundary>
                    <div className="absolute inset-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={120}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

                                <Bar
                                    dataKey="registeredFinal"
                                    stackId="a"
                                    radius={[0, 0, 0, 0]}
                                    barSize={20}
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-1-${index}`}
                                            fill={activeIndex === index ? '#059669' : '#047857'}
                                            className="transition-all duration-300 cursor-pointer"
                                        />
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
                                        <Cell
                                            key={`cell-2-${index}`}
                                            fill={activeIndex === index ? '#10b981' : '#34d399'}
                                            className="transition-all duration-300 cursor-pointer"
                                            style={activeIndex === index ? { filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.6))' } : {}}
                                        />
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
                                        <Cell
                                            key={`cell-3-${index}`}
                                            fill={activeIndex === index ? '#2563eb' : '#3b82f6'}
                                            fillOpacity={activeIndex === index ? 0.6 : 0.3}
                                            className="transition-all duration-300 cursor-pointer"
                                            style={activeIndex === index ? { filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' } : {}}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="total"
                                        position="right"
                                        fill="#64748b"
                                        className="font-extrabold text-xs dark:fill-slate-400"
                                        offset={10}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartErrorBoundary>
            </div>
        </Card>
    );
});

export default TopPartiesChart;

import { BarChart as BarChartIcon } from 'lucide-react';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function CountyChart({ data, onSelect }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 mb-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <BarChartIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                Vármegyei eloszlás (Összes jelölt)
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
                        onClick={(data) => {
                            if (data && data.activePayload) onSelect(data.activePayload[0].payload);
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="nev"
                            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            angle={-45}
                            textAnchor="end"
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: 'rgba(235, 248, 255, 0.4)' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                fontWeight: 'bold'
                            }}
                        />
                        <Bar dataKey="candidateCount" fill="#10b981" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

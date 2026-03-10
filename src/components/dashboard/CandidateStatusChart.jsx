import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Tooltip as RechartsTooltip, Cell, Sector } from 'recharts';
import { FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const [activeIndex, setActiveIndex] = useState(null);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    className="transition-all duration-300"
                    style={{ filter: `drop-shadow(0px 0px 8px ${fill}80)` }}
                />
            </g>
        );
    };

    const listVariant = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, x: 20 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="glass-card rounded-xl p-5 md:p-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                Feldolgozottság Állapota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-64 flex justify-center items-center relative" style={{ minHeight: '256px', minWidth: '0' }}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={250} minWidth={0} debounce={50}>
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={85}
                                paddingAngle={3}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                        {activeIndex !== null ? (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                                <span className="text-3xl font-black drop-shadow-md" style={{ color: pieData[activeIndex].color }}>
                                    {pieData[activeIndex].value}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold max-w-[100px] text-center leading-tight mt-1">
                                    {pieData[activeIndex].name}
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                                <span className="text-3xl font-black text-slate-800 dark:text-white drop-shadow-sm">{totalCount}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider text-center mt-0.5">Összes<br />bejelentés</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-6">
                    {/* Neon-like segmented progress bar */}
                    <div className="w-full h-4 rounded-full bg-slate-100/50 dark:bg-slate-800/50 flex overflow-hidden shadow-inner flex-shrink-0 p-0.5 gap-0.5 border border-white/20 dark:border-slate-700/30">
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_8px_#14532d] z-10" style={{ backgroundColor: '#14532d', width: `${(statusCategories.registered / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#86efac]" style={{ backgroundColor: '#86efac', width: `${(statusCategories.registered_pre / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#60a5fa]" style={{ backgroundColor: '#60a5fa', width: `${(statusCategories.pending / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000" style={{ backgroundColor: '#94a3b8', width: `${(statusCategories.not_starting / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#ef4444]" style={{ backgroundColor: '#ef4444', width: `${(statusCategories.deleted / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#fca5a5]" style={{ backgroundColor: '#fca5a5', width: `${(statusCategories.visszautasitva_pre / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_8px_#991b1b] z-10" style={{ backgroundColor: '#991b1b', width: `${(statusCategories.visszautasitva_final / Math.max(1, totalCount)) * 100}%` }}></div>
                    </div>

                    <motion.div variants={listVariant} initial="hidden" animate="show" className="flex flex-col gap-2 text-sm p-1">
                        {statusBreakdown.filter(s => s.count > 0).map((status, idx) => (
                            <motion.div
                                variants={itemVariant}
                                key={idx}
                                onMouseEnter={() => {
                                    const mappedIndex = pieData.findIndex(p => p.name === status.name);
                                    if (mappedIndex !== -1) setActiveIndex(mappedIndex);
                                }}
                                onMouseLeave={() => setActiveIndex(null)}
                                onClick={() => onStatusClick && onStatusClick(status.name)}
                                className={`flex items-center justify-between group p-2.5 rounded-xl border border-transparent transition-all ${onStatusClick ? 'cursor-pointer bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-200/50 dark:hover:border-slate-700/50 active:scale-[0.98]' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-125" style={{ backgroundColor: colors[status.type] || '#cbd5e1', boxShadow: `0 0 8px ${colors[status.type] || '#cbd5e1'}80` }}></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs transition-colors truncate max-w-[150px] md:max-w-[200px] group-hover:text-slate-900 dark:group-hover:text-white">{status.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`font-black text-sm transition-all ${textColors[status.type] || 'text-slate-500'} group-hover:scale-110`}>{status.count}</span>
                                    {onStatusClick && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

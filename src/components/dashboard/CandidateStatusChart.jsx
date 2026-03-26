import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Card, ChartErrorBoundary } from '../ui';
import { PieChart as PieChartIcon, ChevronRight } from 'lucide-react'; // Assuming PieChartIcon is from lucide-react
import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {Record<string, number>} props.statusCategories
 * @param {Record<string, number>} props.statusBreakdown
 * @param {(status: string) => void} props.onStatusClick
 */
const CandidateStatusChart = React.memo(({ statusCategories, statusBreakdown, onStatusClick }) => {
    const totalCount = (statusCategories && typeof statusCategories === 'object') 
        ? Object.values(statusCategories).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0) 
        : 0;

    const pieData = statusCategories ? [
        { name: 'Nyilvántartásba véve', value: statusCategories.registered || 0, color: '#14532d' },
        { name: 'Nyilvántartásba véve (nem jogerős)', value: statusCategories.registered_pre || 0, color: '#86efac' },
        { name: 'Folyamatban', value: statusCategories.pending || 0, color: '#60a5fa' },
        { name: 'Nem kíván indulni', value: statusCategories.not_starting || 0, color: '#94a3b8' },
        { name: 'Törölve/Elutasítva', value: statusCategories.deleted || 0, color: '#ef4444' },
        { name: 'Visszautasítva (nem jogerős)', value: statusCategories.visszautasitva_pre || 0, color: '#fca5a5' },
        { name: 'Visszautasítva', value: statusCategories.visszautasitva_final || 0, color: '#991b1b' }
    ].filter(d => d.value > 0) : [];

    const colors = {
        registered: '#14532d',
        registered_pre: '#86efac',
        pending: '#60a5fa',
        not_starting: '#94a3b8',
        deleted: '#ef4444',
        visszautasitva_pre: '#fca5a5',
        visszautasitva_final: '#991b1b'
    };

    // textColors and listVariant/itemVariant are not used in the new JSX structure,
    // but keeping them as the instruction was to only apply the provided diff.
    const textColors = {
        registered: 'text-green-900 dark:text-green-500',
        registered_pre: 'text-green-600 dark:text-green-400',
        pending: 'text-blue-600 dark:text-blue-400',
        not_starting: 'text-slate-500 dark:text-slate-400',
        deleted: 'text-red-500 dark:text-red-400',
        visszautasitva_pre: 'text-red-400 dark:text-red-300',
        visszautasitva_final: 'text-red-800 dark:text-red-600'
    };

    /** @type {[number | null, React.Dispatch<React.SetStateAction<number | null>>]} */
    const [activeIndex, setActiveIndex] = useState(null);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    // onPieLeave is not used in the new JSX structure, but keeping it.
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

    // listVariant and itemVariant are not used in the new JSX structure, but keeping them.
    const listVariant = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, x: 20 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // CustomTooltip is referenced in the new JSX but not defined in the provided diff.
    // Adding a basic placeholder for it to ensure syntactical correctness.
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-2 bg-white dark:bg-slate-700 rounded-md shadow-lg text-sm font-bold text-slate-800 dark:text-white">
                    <p>{`${data.name}: ${data.value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white transition-colors">Jelöltek Státusza</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Összetétel eloszlás</p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <PieChartIcon className="w-5 h-5" />
                </div>
            </div>

            <ChartErrorBoundary>
                <div className="flex flex-col md:flex-row gap-8 items-center mt-2">
                    <div className="w-full md:w-1/2 relative h-[280px]">
                        <div className="absolute inset-0">
                            <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                        <feOffset dx="0" dy="4" result="offsetblur" />
                                        <feComponentTransfer>
                                            <feFuncA type="linear" slope="0.3" />
                                        </feComponentTransfer>
                                        <feMerge>
                                            <feMergeNode />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={105}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    onMouseLeave={() => setActiveIndex(null)}
                                    stroke="none"
                                    paddingAngle={5}
                                    isAnimationActive={true}
                                    filter="url(#pieShadow)"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                        {activeIndex !== null && pieData[activeIndex] ? (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                                <span className="text-3xl font-black drop-shadow-md" style={{ color: pieData[activeIndex].color }}>
                                    {pieData[activeIndex].value}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold max-w-[100px] text-center leading-tight mt-1">
                                    {pieData[activeIndex].name}
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-slate-300 dark:text-slate-700">
                                <span className="text-3xl font-black uppercase tracking-widest">{pieData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
                    {/* Neon-like segmented progress bar */}
                    <div className="w-full h-4 rounded-full bg-slate-100/50 dark:bg-slate-800/50 flex overflow-hidden shadow-inner flex-shrink-0 p-0.5 gap-0.5 border border-white/20 dark:border-slate-700/30">
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_8px_#14532d] z-10" style={{ backgroundColor: '#14532d', width: `${((statusCategories?.registered || 0) / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#86efac]" style={{ backgroundColor: '#86efac', width: `${((statusCategories?.registered_pre || 0) / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#60a5fa]" style={{ backgroundColor: '#60a5fa', width: `${((statusCategories?.pending || 0) / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000" style={{ backgroundColor: '#94a3b8', width: `${((statusCategories?.not_starting || 0) / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#ef4444]" style={{ backgroundColor: '#ef4444', width: `${((statusCategories?.deleted || 0) / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_5px_#fca5a5]" style={{ backgroundColor: '#fca5a5', width: `${((statusCategories?.visszautasitva_pre || 0) / Math.max(1, totalCount)) * 100}%` }}></div>
                        <div className="h-full rounded-sm transition-all duration-1000 shadow-[0_0_8px_#991b1b] z-10" style={{ backgroundColor: '#991b1b', width: `${((statusCategories?.visszautasitva_final || 0) / Math.max(1, totalCount)) * 100}%` }}></div>
                    </div>

                    <motion.div variants={listVariant} initial="hidden" animate="show" className="flex flex-col gap-2 text-sm p-1">
                        {(statusBreakdown || []).filter(s => s.count > 0).map((status, idx) => (
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
            </ChartErrorBoundary>
        </Card>
    );
});

export default CandidateStatusChart;

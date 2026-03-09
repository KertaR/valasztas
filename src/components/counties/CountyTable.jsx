import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ChevronUp, Map, PieChart } from 'lucide-react';
import { DataTable } from '../ui';

export default function CountyTable({ data, enrichedData, onSelectOevk }) {
    const [expandedCountyId, setExpandedCountyId] = useState(null);

    const toggleRow = (countyId) => {
        if (expandedCountyId === countyId) {
            setExpandedCountyId(null);
        } else {
            setExpandedCountyId(countyId);
        }
    };

    const columns = [
        {
            header: 'Vármegye Neve',
            render: (county) => {
                const isExpanded = expandedCountyId === county.id;
                return (
                    <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-5 h-5 text-indigo-500 dark:text-indigo-400 transition-colors" />
                            {county.nev}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Kerületek (OEVK)',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: (county) => (
                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    {county.oevkCount}
                </span>
            )
        },
        {
            header: 'Összes Választó',
            headerClassName: 'text-right',
            cellClassName: 'text-right font-medium text-slate-600 dark:text-slate-400 transition-colors',
            render: (county) => county.voterCount.toLocaleString('hu-HU')
        },
        {
            header: 'Összes Jelölt',
            headerClassName: 'text-right',
            cellClassName: 'text-right transition-colors',
            render: (county) => (
                <span className="font-bold text-blue-700 dark:text-blue-400">
                    {county.candidateCount}
                </span>
            )
        },
        {
            header: 'Átlag Jelölt / OEVK',
            headerClassName: 'text-right',
            cellClassName: 'text-right transition-colors',
            render: (county) => {
                const avgCandidates = county.oevkCount > 0
                    ? (county.candidateCount / county.oevkCount).toFixed(1)
                    : 0;
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm border transition-colors ${avgCandidates >= 5 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'}`}>
                        {avgCandidates} fő
                    </span>
                );
            }
        }
    ];

    const getExpandedContent = (county) => {
        let countyOevks = [];
        let distributionData = [];

        if (enrichedData) {
            countyOevks = enrichedData.districts.filter(d => d.maz === county.id);
            const partyStats = {};
            let independentCount = 0;

            enrichedData.candidates.forEach(c => {
                if (c.maz === county.id) {
                    if (c.partyNames === 'Független') {
                        independentCount++;
                    } else {
                        partyStats[c.partyNames] = (partyStats[c.partyNames] || 0) + 1;
                    }
                }
            });

            const sortedParties = Object.entries(partyStats)
                .map(([name, count]) => ({ name, count, isParty: true }))
                .sort((a, b) => b.count - a.count);

            distributionData = [...sortedParties];
            if (independentCount > 0) {
                distributionData.push({ name: 'Független jelöltek (Összesen)', count: independentCount, isParty: false });
            }
        }

        return (
            <AnimatePresence>
                <tr>
                    <td colSpan={5} className="bg-slate-50 dark:bg-slate-900/40 p-0 border-b border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-6 md:p-8 space-y-8 border-l-2 border-indigo-500">
                                {/* Party Distribution */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <PieChart className="w-4 h-4" />
                                            Jelöltek megoszlása
                                        </h3>
                                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                            <div className="space-y-3">
                                                {distributionData.slice(0, 7).map((item, idxx) => {
                                                    const totalActiveInCounty = distributionData.reduce((acc, curr) => acc + curr.count, 0);
                                                    const percent = Math.round((item.count / totalActiveInCounty) * 100);
                                                    return (
                                                        <div key={item.name} className="space-y-1">
                                                            <div className="flex justify-between text-[11px] font-bold">
                                                                <span className={`${item.isParty ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 font-black'} truncate max-w-[200px] sm:max-w-[250px] uppercase tracking-tight`}>
                                                                    {item.name}
                                                                </span>
                                                                <span className="text-slate-500 dark:text-slate-400">{item.count} jelölt ({percent}%)</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percent}%` }}
                                                                    transition={{ duration: 1, delay: idxx * 0.1 }}
                                                                    className={`h-full ${!item.isParty ? 'bg-slate-400 dark:bg-slate-500' : (idxx === 0 ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-indigo-400')}`}
                                                                ></motion.div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {distributionData.length > 7 && (
                                                    <p className="text-[10px] text-slate-400 font-bold italic pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                                                        + további {distributionData.length - 7} szervezet jelöltjei
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* OEVKs Grid */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Map className="w-4 h-4" />
                                                Választókerületek
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                            {countyOevks.map(oevk => (
                                                <div
                                                    key={`${oevk.maz}-${oevk.evk}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onSelectOevk) onSelectOevk(oevk);
                                                    }}
                                                    className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer group transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">{oevk.maz_nev} {oevk.evk}.</span>
                                                        <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{oevk.candidateCount} jelölt</span>
                                                    </div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{oevk.evk_nev}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </td>
                </tr>
            </AnimatePresence>
        );
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            onRowClick={(county) => toggleRow(county.id)}
            keyExtractor={(county) => county.id}
            rowClassName={(county) => {
                const isExpanded = expandedCountyId === county.id;
                return isExpanded ? 'bg-slate-50 dark:bg-slate-800/80 shadow-inner border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent';
            }}
            renderExpandedRow={(county) => expandedCountyId === county.id ? getExpandedContent(county) : null}
        />
    );
}

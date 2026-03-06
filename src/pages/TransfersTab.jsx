import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Users, ArrowRightLeft, Search } from 'lucide-react';
import { useUIContext, useDataContext } from '../contexts';

export default function TransfersTab() {
    const { enrichedData } = useDataContext();
    const { setSelectedOevk } = useUIContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('total');

    const transferData = useMemo(() => {
        return enrichedData.districts.map(dist => {
            // A Választás.hu 2026-os struktúrája alapján
            const kulkep = dist.letszam?.kuvi || dist.letszam?.kulkep || 0;
            const atjel = dist.letszam?.atjel || dist.letszam?.atjelentkezo || 0;
            const atjelInnen = dist.letszam?.atjelInnen || 0;
            const nettoAtjel = atjel - atjelInnen;
            const belfoldi = dist.letszam?.indulo || 0;
            const total = kulkep + atjel;

            return {
                ...dist,
                kulkep,
                atjel,
                atjelInnen,
                nettoAtjel,
                belfoldi,
                total,
                percent: belfoldi > 0 ? ((total / belfoldi) * 100).toFixed(2) : 0
            };
        }).sort((a, b) => {
            if (sortBy === 'total') return b.total - a.total;
            if (sortBy === 'kulkep') return b.kulkep - a.kulkep;
            if (sortBy === 'atjel') return b.atjel - a.atjel;
            if (sortBy === 'percent') return b.percent - a.percent;
            return 0;
        });
    }, [enrichedData.districts, sortBy]);

    const filteredData = transferData.filter(d =>
        d.evk_nev.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.maz_nev.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalKulkep = transferData.reduce((acc, curr) => acc + curr.kulkep, 0);
    const totalAtjel = transferData.reduce((acc, curr) => acc + curr.atjel, 0);
    const totalAtjelInnen = transferData.reduce((acc, curr) => acc + curr.atjelInnen, 0);
    const totalVoters = transferData.reduce((acc, curr) => acc + curr.belfoldi, 0);

    const diffKulkep = transferData.reduce((acc, curr) => acc + (curr.kulkepDiff || 0), 0);
    const diffAtjel = transferData.reduce((acc, curr) => acc + (curr.atjelDiff || 0), 0);
    const diffAtjelInnen = transferData.reduce((acc, curr) => acc + (curr.atjelInnenDiff || 0), 0);

    const renderDiffBadge = (diff, invertColor = false) => {
        if (!diff) return null;
        const colorClass = diff > 0
            ? (invertColor ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30')
            : (invertColor ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30');

        return (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ml-2 inline-flex items-center align-middle whitespace-nowrap ${colorClass}`}>
                {diff > 0 ? '+' : ''}{diff.toLocaleString('hu-HU')}
            </span>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Átjelentkezők és Külképviselet
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Azoknak a választóknak a száma, akik nem a lakóhelyükön szavaznak</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                        <ArrowRightLeft className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/50"><ArrowRightLeft className="w-5 h-5" /></div>
                        <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Belső Vándorlás</h3>
                    </div>
                    <div className="relative z-10">
                        <p className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                            {totalAtjel.toLocaleString('hu-HU')}
                            {renderDiffBadge(diffAtjel)}
                        </p>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Jelentkezők (Ide érkezők)</p>
                        {totalAtjelInnen > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Másik OEVK-ba (Elvándorlók)</span>
                                <span className="text-xs font-black text-rose-500 flex items-center gap-1">-{totalAtjelInnen.toLocaleString('hu-HU')} {renderDiffBadge(-diffAtjelInnen, true)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                        <Globe className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/50"><Globe className="w-5 h-5" /></div>
                        <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Külképviselet</h3>
                    </div>
                    <div className="relative z-10">
                        <p className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                            {totalKulkep.toLocaleString('hu-HU')}
                            {renderDiffBadge(diffKulkep)}
                        </p>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Külföldön szavazók névjegyzéke</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-700/50 transition-colors flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                        <Users className="w-24 h-24 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2.5 bg-gradient-to-br from-purple-100 to-fuchsia-50 dark:from-purple-900/40 dark:to-fuchsia-900/20 text-purple-600 dark:text-purple-400 rounded-xl shadow-sm border border-purple-200/50 dark:border-purple-800/50"><Users className="w-5 h-5" /></div>
                        <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Teljes Arány</h3>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-black text-purple-600 dark:text-purple-400/90 leading-none">
                                    {totalVoters > 0 ? (((totalAtjel + totalKulkep) / totalVoters) * 100).toFixed(2) : '0'}%
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Extrajogosult</p>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-300">{(totalAtjel + totalKulkep).toLocaleString('hu-HU')} fő</p>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-1000" style={{ width: `${totalVoters > 0 ? (((totalAtjel + totalKulkep) / totalVoters) * 100) : 0}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Keress OEVK-ra vagy megyére..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2 text-sm bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-fit">
                        <button onClick={() => setSortBy('total')} className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${sortBy === 'total' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Összes</button>
                        <button onClick={() => setSortBy('atjel')} className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${sortBy === 'atjel' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Belföldi</button>
                        <button onClick={() => setSortBy('kulkep')} className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${sortBy === 'kulkep' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Külföldi</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <th className="p-4 font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">OEVK Neve</th>
                                <th className="p-4 font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest text-right">Átjelentkezők (Ide)</th>
                                <th className="p-4 font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest text-right">Elvándorlók (Innen)</th>
                                <th className="p-4 font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest text-right whitespace-nowrap">Nettó Vándorlás</th>
                                <th className="p-4 font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest text-right">Külképviselet</th>
                                <th className="p-4 font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest text-right">Összes Extrajogosult</th>
                                <th className="p-4 font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest min-w-[120px]">Arány</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredData.map(d => (
                                <tr key={`${d.maz}-${d.evk}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => setSelectedOevk(d)}>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.maz_nev} {d.evk}. OEVK</div>
                                        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{d.evk_nev}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{d.atjel.toLocaleString('hu-HU')}</span>
                                        <div className="inline-block min-w-[36px]">{renderDiffBadge(d.atjelDiff)}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">{d.atjelInnen > 0 ? `-${d.atjelInnen.toLocaleString('hu-HU')}` : '0'}</span>
                                        <div className="inline-block min-w-[36px]">{d.atjelInnen > 0 ? renderDiffBadge(-d.atjelInnenDiff, true) : null}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black shadow-sm border ${d.nettoAtjel > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : (d.nettoAtjel < 0 ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700')}`}>
                                            {d.nettoAtjel > 0 ? '+' : ''}{d.nettoAtjel.toLocaleString('hu-HU')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{d.kulkep.toLocaleString('hu-HU')}</span>
                                        <div className="inline-block min-w-[36px]">{renderDiffBadge(d.kulkepDiff)}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 px-2.5 py-1 rounded-lg shadow-sm">
                                            {d.total.toLocaleString('hu-HU')}
                                        </span>
                                        <div className="inline-block min-w-[36px]">{renderDiffBadge(d.totalDiff)}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 w-full">
                                            <span className="text-right font-black text-slate-600 dark:text-slate-300 text-sm leading-none">{d.percent}%</span>
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner w-24 ml-auto">
                                                <div
                                                    className="h-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)] transition-all duration-700"
                                                    style={{ width: `${Math.min(100, d.percent)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">Nincs a keresésnek megfelelő OEVK.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

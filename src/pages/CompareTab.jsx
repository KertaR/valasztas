import { useState, useRef } from 'react';
import { UserCircle2, Scale, Building2, Download, Loader2, Info, Users, PieChart, Activity } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';

// Compare Components
import { CandidateSearch, OrgSearch, CandidateCompareCard, OrgCompareCard } from '../components';

export default function CompareTab({ enrichedData }) {
    const [mode, setMode] = useState('candidates'); // 'candidates' or 'organizations'
    const [itemA, setItemA] = useState(null);
    const [itemB, setItemB] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const compareRef = useRef(null);

    const exportImage = async () => {
        if (!compareRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(compareRef.current, {
                cacheBust: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f1f5f9',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `${mode === 'candidates' ? 'jelolt' : 'part'}_osszehasonlitas_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Image export failed:', err);
            alert('Hiba történt a kép generálása közben.');
        } finally {
            setIsExporting(false);
        }
    };

    const isSameParty = mode === 'candidates' && itemA && itemB && itemA.partyNames === itemB.partyNames;
    const isSameCounty = mode === 'candidates' && itemA && itemB && itemA.countyName === itemB.countyName;
    const isSameDistrict = mode === 'candidates' && itemA && itemB && itemA.districtName === itemB.districtName;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-6xl mx-auto transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 transition-colors">
                        <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Összehasonlítás
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">Válassz összehasonlítási módot és elemezd az adatokat.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Mode Toggle */}
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex shadow-sm">
                        <button
                            onClick={() => { setMode('candidates'); setItemA(null); setItemB(null); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'candidates' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <UserCircle2 className="w-4 h-4 inline mr-2" />
                            Jelöltek
                        </button>
                        <button
                            onClick={() => { setMode('organizations'); setItemA(null); setItemB(null); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'organizations' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Pártok
                        </button>
                    </div>

                    {itemA && itemB && (
                        <button
                            onClick={exportImage}
                            disabled={isExporting}
                            className="bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 p-3 rounded-xl shadow-md disabled:opacity-70 transition-all flex items-center gap-2 font-bold focus:outline-none"
                        >
                            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            <span className="hidden sm:block">Mentés képként</span>
                        </button>
                    )}
                </div>
            </div>

            {/* EXPORTÁLHATÓ ZÓNA */}
            <div ref={compareRef} className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">

                {/* Oszlopok (Keresők és Kártyák) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Column A */}
                    <div className="flex flex-col gap-4">
                        {mode === 'candidates' ? (
                            <CandidateSearch
                                value={itemA}
                                onChange={setItemA}
                                candidates={enrichedData.candidates}
                                placeholder="Keresés az első jelöltre..."
                            />
                        ) : (
                            <OrgSearch
                                value={itemA}
                                onChange={setItemA}
                                organizations={enrichedData.organizations}
                                placeholder="Keresés az első pártra..."
                            />
                        )}
                        <div className="flex-1 mt-2">
                            {mode === 'candidates' ? (
                                <CandidateCompareCard candidate={itemA} />
                            ) : (
                                <OrgCompareCard org={itemA} />
                            )}
                        </div>
                    </div>

                    {/* Column B */}
                    <div className="flex flex-col gap-4">
                        {mode === 'candidates' ? (
                            <CandidateSearch
                                value={itemB}
                                onChange={setItemB}
                                candidates={enrichedData.candidates}
                                placeholder="Keresés a második jelöltre..."
                            />
                        ) : (
                            <OrgSearch
                                value={itemB}
                                onChange={setItemB}
                                organizations={enrichedData.organizations}
                                placeholder="Keresés a második pártra..."
                            />
                        )}
                        <div className="flex-1 mt-2">
                            {mode === 'candidates' ? (
                                <CandidateCompareCard candidate={itemB} />
                            ) : (
                                <OrgCompareCard org={itemB} />
                            )}
                        </div>
                    </div>
                </div>

                {/* --- ELEMZÉSI ZÓNA (Közös pontok & Stratégia) --- */}
                {itemA && itemB && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 transition-colors">

                        {/* JELÖLT ELEMZÉS */}
                        {mode === 'candidates' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 md:p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex flex-col gap-4 transition-colors">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-black text-sm uppercase tracking-widest px-1">
                                    <Info className="w-5 h-5" />
                                    <span>Összehasonlító Elemzés</span>
                                </div>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {isSameDistrict ? (
                                        <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50 shadow-sm flex items-center gap-2"><Activity className="w-4 h-4" />Közvetlen Ellenfelek (Azonos körzet)</span>
                                    ) : isSameCounty ? (
                                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-200 dark:border-amber-800/50 shadow-sm flex items-center gap-2"><MapPin className="w-4 h-4" />Azonos vármegye ({itemA.countyName})</span>
                                    ) : (
                                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">Különböző választókerület</span>
                                    )}

                                    {isSameParty && (
                                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-200 dark:border-indigo-800/50 shadow-sm flex items-center gap-2"><Users className="w-4 h-4" />Párttársak ({itemA.partyNames})</span>
                                    )}

                                    {itemA.statusName === 'Jogerős' && itemB.statusName !== 'Jogerős' && (
                                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/50 shadow-sm">"{itemA.neve}" regisztrációja már jogerős</span>
                                    )}

                                    {itemB.statusName === 'Jogerős' && itemA.statusName !== 'Jogerős' && (
                                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/50 shadow-sm">"{itemB.neve}" regisztrációja már jogerős</span>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* PÁRT STRATÉGIA ELEMZÉS */}
                        {mode === 'organizations' && (
                            <div className="space-y-6">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 md:p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex flex-wrap items-center gap-4 transition-colors">
                                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold px-2 text-sm uppercase tracking-wider">
                                        <PieChart className="w-5 h-5" />
                                        <span>Országos Elemzés:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full mt-2">
                                        {itemA.registeredCoveragePercent >= 67 && itemB.registeredCoveragePercent >= 67 ? (
                                            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/50 shadow-sm">Mindkét szervezet elérheti a listaállítást</span>
                                        ) : itemA.registeredCoveragePercent >= 67 || itemB.registeredCoveragePercent >= 67 ? (
                                            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold border border-blue-200 dark:border-blue-800/50 shadow-sm">Jelentős különbség a listaállítási küszöb elérésében</span>
                                        ) : null}

                                        <span className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                                            Jelöltállomány különbség: <span className="text-indigo-600 dark:text-indigo-400">{Math.abs(itemA.candidateCount - itemB.candidateCount)} fő</span>
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Stratégiai Átfedés Analízis */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden transition-colors">
                                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <Activity className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">OEVK Összecsapás & Stratégiai Átfedés</h3>
                                    </div>

                                    {(() => {
                                        const setA = itemA.registeredOevkSet || new Set();
                                        const setB = itemB.registeredOevkSet || new Set();

                                        const shared = [...setA].filter(id => setB.has(id)).length;
                                        const onlyA = [...setA].filter(id => !setB.has(id)).length;
                                        const onlyB = [...setB].filter(id => !setA.has(id)).length;

                                        const overlapPercent = Math.round((shared / Math.max(1, setA.size, setB.size)) * 100);

                                        return (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/50 text-center relative overflow-hidden">
                                                        <div className="absolute -right-4 -top-4 opacity-5"><Activity className="w-24 h-24" /></div>
                                                        <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase mb-2 tracking-widest relative z-10">Közvetlen Versengés</p>
                                                        <p className="text-4xl font-black text-blue-700 dark:text-blue-400 relative z-10">{shared}</p>
                                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-bold mt-1 relative z-10">Közös körzet (Jogerős)</p>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-inner relative overflow-hidden">
                                                        <div className="absolute -right-4 -top-4 opacity-5 text-slate-900 dark:text-white"><Building2 className="w-24 h-24" /></div>
                                                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-widest relative z-10">Csak a(z) {itemA.r_nev || 'A'}</p>
                                                        <p className="text-4xl font-black text-slate-800 dark:text-slate-100 relative z-10">{onlyA}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 relative z-10">Egyéni dominancia</p>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-inner relative overflow-hidden">
                                                        <div className="absolute -right-4 -top-4 opacity-5 text-slate-900 dark:text-white"><Building2 className="w-24 h-24" /></div>
                                                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-widest relative z-10">Csak a(z) {itemB.r_nev || 'B'}</p>
                                                        <p className="text-4xl font-black text-slate-800 dark:text-slate-100 relative z-10">{onlyB}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 relative z-10">Egyéni dominancia</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                                                        <span className="text-slate-600 dark:text-slate-400">Területi Átfedési Index:</span>
                                                        <span className="text-indigo-600 dark:text-indigo-400 text-lg">{overlapPercent}%</span>
                                                    </div>
                                                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors shadow-inner">
                                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${overlapPercent}%` }}></div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2">
                                                        *Ez a mutató azt jelzi, hogy a két párt a választókerületek mekkora részében állított egymással közvetlenül szemben regisztrált jelölteket.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </motion.div>
    );
}

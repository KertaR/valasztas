import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Download, Zap, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

import { useSeatCalculator } from '../hooks/useSeatCalculator';
import ParliamentChart from '../components/calculator/ParliamentChart';
import CalculatorControls from '../components/calculator/CalculatorControls';
import CalculatorResults from '../components/calculator/CalculatorResults';

const PRESETS = [
    { label: 'Medián (jan.)', votes: { fidesz: 45, tisza: 33, dk: 6, mhm: 7, egyhat: 0, egyeb: 9 } },
    { label: 'Publicus (jan.)', votes: { fidesz: 42, tisza: 35, dk: 8, mhm: 6, egyhat: 0, egyeb: 9 } },
    { label: 'Závecz (jan.)', votes: { fidesz: 46, tisza: 32, dk: 6, mhm: 5, egyhat: 0, egyeb: 11 } },
    { label: '50-50 eset', votes: { fidesz: 44, tisza: 44, dk: 0, mhm: 6, egyhat: 0, egyeb: 6 } },
    { label: 'Ellenzéki előny', votes: { fidesz: 36, tisza: 44, dk: 7, mhm: 5, egyhat: 0, egyeb: 8 } },
];

export default function SeatCalculatorTab() {
    const calcRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    // Országos listás szavazatarányok (%)
    const [votes, setVotes] = useState({
        fidesz: 42,
        tisza: 35,
        dk: 8,
        mhm: 6,
        egyhat: 0,
        egyeb: 9
    });

    const [fractionalBonus, setFractionalBonus] = useState(15);

    // Handle slider change
    const handleVoteChange = (party, value) => {
        setVotes(prev => ({ ...prev, [party]: parseInt(value) }));
    };

    const normalizeVotes = () => {
        const currentTotal = Object.values(votes).reduce((a, b) => a + b, 0);
        if (currentTotal === 0) return;
        const normalized = {};
        for (const p in votes) {
            normalized[p] = Math.round((votes[p] / currentTotal) * 100);
        }
        // Fix rounding errors
        const newTotal = Object.values(normalized).reduce((a, b) => a + b, 0);
        if (newTotal !== 100) {
            const maxParty = Object.keys(normalized).reduce((a, b) => normalized[a] > normalized[b] ? a : b);
            normalized[maxParty] += (100 - newTotal);
        }
        setVotes(normalized);
    };

    const exportImage = async () => {
        if (!calcRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(calcRef.current, {
                cacheBust: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `mandatumbecslo_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Image export failed:', err);
            alert('Hiba történt a kép generálása közben.');
        } finally {
            setIsExporting(false);
        }
    };

    // Use our custom hook
    const {
        mandates,
        parliamentSeats,
        leadingParty,
        leadingStatus,
        leadingColor
    } = useSeatCalculator(votes, fractionalBonus);

    const totalVotePercent = Object.values(votes).reduce((a, b) => a + b, 0);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Mandátumbecslő Kalkulátor
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">"Mi lenne, ha holnap lenne a választás?" Szimuláld az eredményeket országos listás arányok alapján.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={exportImage}
                        disabled={isExporting}
                        className="px-4 py-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isExporting ? 'Mentés...' : 'Exportálás'}</span>
                    </button>
                    {/* Preset gyorsbeállítások */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="px-2 flex items-center text-slate-400"><Zap className="w-3.5 h-3.5" /></div>
                        {PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => setVotes(p.votes)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:shadow-sm"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {totalVotePercent !== 100 && (
                        <button onClick={normalizeVotes} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-sm">
                            Normalizálás (100%)
                        </button>
                    )}
                </div>
            </div>

            <div ref={calcRef} className="space-y-6 pt-2 pb-4 px-2 -mx-2 sm:mx-0 sm:px-0 rounded-3xl sm:bg-transparent">
                <ParliamentChart
                    parliamentSeats={parliamentSeats}
                    leadingParty={leadingParty}
                    leadingStatus={leadingStatus}
                    leadingColor={leadingColor}
                />

                {/* Config & Results Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
                        <CalculatorControls
                            votes={votes}
                            handleVoteChange={handleVoteChange}
                            fractionalBonus={fractionalBonus}
                            setFractionalBonus={setFractionalBonus}
                            totalVotePercent={totalVotePercent}
                        />
                    </div>

                    <CalculatorResults mandates={mandates} />
                </div>
            </div>
        </motion.div>
    );
}

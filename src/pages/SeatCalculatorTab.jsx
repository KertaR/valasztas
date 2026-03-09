import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap } from 'lucide-react';
import { PageLayout, ExportButton } from '../components/ui';
import { useExportImage } from '../hooks/useExportImage';

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
    const { exportImage, isExporting } = useExportImage(calcRef, 'mandatumbecslo');

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
        <PageLayout
            title="Mandátumbecslő Kalkulátor"
            subtitle="&#34;Mi lenne, ha holnap lenne a választás?&#34; Szimuláld az eredményeket országos listás arányok alapján."
            icon={Calculator}
            actions={
                <>
                    <ExportButton onClick={exportImage} isExporting={isExporting} />
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
                </>
            }
            contentRef={calcRef}
        >
            <>
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
            </>
        </PageLayout>
    );
}

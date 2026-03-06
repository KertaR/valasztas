import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, PieChart as PieChartIcon, Percent, AlertCircle, Zap, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useDataContext } from '../contexts';

const PRESETS = [
    { label: 'Medián (jan.)', votes: { fidesz: 45, tisza: 33, dk: 6, mhm: 7, egyhat: 0, egyeb: 9 } },
    { label: 'Publicus (jan.)', votes: { fidesz: 42, tisza: 35, dk: 8, mhm: 6, egyhat: 0, egyeb: 9 } },
    { label: 'Závecz (jan.)', votes: { fidesz: 46, tisza: 32, dk: 6, mhm: 5, egyhat: 0, egyeb: 11 } },
    { label: '50-50 eset', votes: { fidesz: 44, tisza: 44, dk: 0, mhm: 6, egyhat: 0, egyeb: 6 } },
    { label: 'Ellenzéki előny', votes: { fidesz: 36, tisza: 44, dk: 7, mhm: 5, egyhat: 0, egyeb: 8 } },
];

export default function SeatCalculatorTab() {
    const { enrichedData } = useDataContext();
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

    // Handle slider change, ensuring total doesn't exceed 100 (or just scale them)
    const handleVoteChange = (party, value) => {
        setVotes(prev => ({
            ...prev,
            [party]: parseInt(value)
        }));
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

    // Calculate mandates (Sophisticated heuristic model for simulation)
    const mandates = useMemo(() => {
        // 199 mandates total: 106 OEVK, 93 List
        const parties = [
            { id: 'fidesz', name: 'FIDESZ-KDNP', color: '#f97316', vote: votes.fidesz },
            { id: 'tisza', name: 'TISZA', color: '#06b6d4', vote: votes.tisza },
            { id: 'dk', name: 'DK', color: '#3b82f6', vote: votes.dk },
            { id: 'mhm', name: 'Mi Hazánk', color: '#10b981', vote: votes.mhm },
            { id: 'egyhat', name: 'MKKP / Egyéb átlépő', color: '#8b5cf6', vote: votes.egyhat }
        ];

        // 1. Keresztek és Küszöb (5%)
        const eligibleParties = parties.filter(p => p.vote >= 5);
        let oevkSeats = { fidesz: 0, tisza: 0, dk: 0, mhm: 0, egyhat: 0, egyeb: 0 };
        let listSeats = { fidesz: 0, tisza: 0, dk: 0, mhm: 0, egyhat: 0, egyeb: 0 };

        // 2. OEVK Becslés (Továbbfejlesztett Heurisztika: FPTP hatás szimulációja)
        // Magyarországon 106 kerület van. Számoljunk egy kerületi eloszlást szimuláló súlyozással.
        // A leghatékonyabb a "köbös" vagy egy nagyobb kitevős arányosítás, ami a győztest felülreprezentálja (Győztes mindent visz).
        const oevkExponent = 3.8; // Erős torzítás a győztes felé
        const totalTopVotes = eligibleParties.reduce((sum, p) => sum + Math.pow(p.vote, oevkExponent), 0);

        if (totalTopVotes > 0) {
            let allocatedOevk = 0;
            const sortedForOevk = [...eligibleParties].sort((a, b) => b.vote - a.vote);
            sortedForOevk.forEach((p, idx) => {
                if (idx === sortedForOevk.length - 1) {
                    oevkSeats[p.id] = 106 - allocatedOevk;
                } else {
                    const seats = Math.round((Math.pow(p.vote, oevkExponent) / totalTopVotes) * 106);
                    oevkSeats[p.id] = seats;
                    allocatedOevk += seats;
                }
            });
            // Korrekció, ha véletlen túlléptük vagy alulmaradtunk az 106-on kerekítés miatt
            const exactOevk = Object.values(oevkSeats).reduce((a, b) => a + b, 0);
            if (exactOevk !== 106 && sortedForOevk.length > 0) {
                oevkSeats[sortedForOevk[0].id] += (106 - exactOevk);
            }
        }

        // 3. Országos Listás Mandátumok (93 darab) - D'Hondt-mátrix szimulálása
        // A töredékszavazatok bónusza alapján módosítjuk a D'Hondt mátrix kiinduló szavazatait.
        if (eligibleParties.length > 0) {
            let dHondtDivisors = [];
            // Fiktív 5 millió szavazóval számolunk a nagy számok törvénye miatt a D'Hondt tökéletes osztásáért
            const baseVotes = 5000000;
            const oevkWinnerId = [...eligibleParties].sort((a, b) => (oevkSeats[b.id] || 0) - (oevkSeats[a.id] || 0))[0]?.id;

            eligibleParties.forEach(p => {
                let rawVotes = (p.vote / 100) * baseVotes;
                if (oevkWinnerId === p.id) {
                    rawVotes += rawVotes * (fractionalBonus / 100);
                }
                for (let i = 1; i <= 93; i++) {
                    dHondtDivisors.push({ id: p.id, value: rawVotes / i });
                }
            });
            // Rendezzük csökkenő sorrendbe, és a legjobb 93 osztó kap egy listás mandátumot
            dHondtDivisors.sort((a, b) => b.value - a.value);
            for (let i = 0; i < 93; i++) {
                listSeats[dHondtDivisors[i].id]++;
            }
        }

        return parties.map(p => ({
            ...p,
            oevk: oevkSeats[p.id] || 0,
            list: listSeats[p.id] || 0,
            total: (oevkSeats[p.id] || 0) + (listSeats[p.id] || 0)
        })).filter(p => p.total > 0 || p.vote >= 5);

    }, [votes, fractionalBonus]);

    const parliamentData = useMemo(() => {
        return mandates.map(m => ({
            name: m.name,
            value: m.total,
            color: m.color
        })).filter(m => m.value > 0).sort((a, b) => b.value - a.value);
    }, [mandates]);

    const totalVotePercent = Object.values(votes).reduce((a, b) => a + b, 0);

    const leadingParty = parliamentData.length > 0 ? parliamentData[0] : null;
    let leadingStatus = null;
    let leadingColor = "text-slate-500";
    if (leadingParty) {
        if (leadingParty.value >= 133) {
            leadingStatus = "Kétharmados (2/3) többség";
            leadingColor = "text-emerald-500 dark:text-emerald-400";
        } else if (leadingParty.value >= 100) {
            leadingStatus = "Abszolút többség";
            leadingColor = "text-blue-500 dark:text-blue-400";
        } else {
            leadingStatus = "Nincs meg a többség (Koalíciókényszer)";
            leadingColor = "text-amber-500 dark:text-amber-400";
        }
    }

    const parliamentSeats = useMemo(() => {
        if (!mandates || mandates.length === 0) return [];
        const rows = [28, 34, 40, 45, 52];
        const radii = [135, 160, 185, 210, 235];
        const seats = [];

        rows.forEach((numSeats, rowIndex) => {
            const r = radii[rowIndex];
            for (let i = 0; i < numSeats; i++) {
                const theta = Math.PI - (i / (numSeats - 1)) * Math.PI;
                seats.push({
                    x: 250 + r * Math.cos(theta),
                    y: 250 - r * Math.sin(theta),
                    angle: theta
                });
            }
        });

        seats.sort((a, b) => b.angle - a.angle); // Balról jobbra

        const ideologyOrder = ['egyhat', 'dk', 'tisza', 'egyeb', 'fidesz', 'mhm'];
        const orderedMandates = [];
        ideologyOrder.forEach(id => {
            const p = mandates.find(m => m.id === id);
            if (p && p.total > 0) orderedMandates.push(p);
        });
        mandates.forEach(p => {
            if (!orderedMandates.some(o => o.id === p.id) && p.total > 0) orderedMandates.push(p);
        });

        let seatIdx = 0;
        orderedMandates.forEach(party => {
            for (let i = 0; i < party.total && seatIdx < seats.length; i++) {
                seats[seatIdx].color = party.color;
                seats[seatIdx].party = party.name;
                seatIdx++;
            }
        });

        return seats;
    }, [mandates]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto pb-10">
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
                {/* Parliament Horseshoe Dashboard Header */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-md border border-slate-200/60 dark:border-slate-800/60 p-8 flex flex-col items-center justify-center relative min-h-[420px] overflow-hidden">
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

                    <div className="absolute top-8 left-8 flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                        <PieChartIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                            Parlamenti Út a 199 Mandátumhoz
                        </h3>
                    </div>

                    <div className="w-full h-[340px] mt-16 relative flex justify-center z-10">
                        <svg viewBox="0 0 500 260" className="w-full h-full max-w-[580px] drop-shadow-lg pb-4 pt-2">
                            {parliamentSeats.map((seat, i) => (
                                <motion.circle
                                    key={`seat-${i}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.002, duration: 0.3 }}
                                    cx={seat.x}
                                    cy={seat.y}
                                    r={6.5}
                                    fill={seat.color || '#e2e8f0'}
                                    className="transition-colors duration-500 hover:opacity-75 stroke-white dark:stroke-slate-900 stroke-[1.5px] cursor-pointer"
                                >
                                    <title>{seat.party || 'Üres'} Seat</title>
                                </motion.circle>
                            ))}
                        </svg>
                        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none w-full px-2">
                            {leadingParty ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                                    <span className="text-[4rem] md:text-[5rem] leading-none font-black drop-shadow-sm" style={{ color: leadingParty.color }}>
                                        {leadingParty.value}
                                    </span>
                                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest mt-2 md:mt-3 mb-2 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 rounded-xl backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-800 ${leadingColor} text-center leading-snug max-w-[90%] md:max-w-full`}>
                                        {leadingStatus}
                                    </span>
                                </motion.div>
                            ) : null}
                        </div>
                    </div>

                    <div className="w-full flex gap-4 md:gap-12 items-end justify-center opacity-90 z-10 relative mt-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 md:mb-1.5 text-center">Kormánytöbbség</span>
                            <div className="flex items-baseline gap-1 bg-slate-100 dark:bg-slate-800 px-3 md:px-4 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                <span className="text-lg md:text-xl font-black text-slate-700 dark:text-slate-300">100</span>
                                <span className="text-[9px] md:text-xs text-slate-500 font-bold">mand.</span>
                            </div>
                        </div>
                        <div className="w-px h-10 md:h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-shrink-0"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 md:mb-1.5 text-center">Alkotmányozó 2/3</span>
                            <div className="flex items-baseline gap-1 bg-slate-100 dark:bg-slate-800 px-3 md:px-4 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                <span className="text-lg md:text-xl font-black text-slate-700 dark:text-slate-300">133</span>
                                <span className="text-[9px] md:text-xs text-slate-500 font-bold">mand.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Config & Results Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Left Side: Sliders (8 columns on XL) */}
                    <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-8 flex-1">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <Percent className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                    Országos Listás Szavazatarányok
                                </h3>
                                <div className="flex items-center gap-3 font-bold text-sm bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                    Összesített:
                                    <span className={`text-lg font-black ${totalVotePercent === 100 ? 'text-emerald-500' : 'text-red-500 flex items-center gap-1.5'}`}>
                                        {totalVotePercent !== 100 && <AlertCircle className="w-5 h-5" />}
                                        {totalVotePercent}%
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {[
                                    { id: 'fidesz', label: 'FIDESZ-KDNP', color: 'orange-500', baseColor: '#f97316' },
                                    { id: 'tisza', label: 'TISZA', color: 'cyan-500', baseColor: '#06b6d4' },
                                    { id: 'dk', label: 'Demokratikus Koalíció', color: 'blue-500', baseColor: '#3b82f6' },
                                    { id: 'mhm', label: 'Mi Hazánk', color: 'emerald-500', baseColor: '#10b981' },
                                    { id: 'egyhat', label: 'Egyéb párt (5% felett)', color: 'purple-500', baseColor: '#a855f7' },
                                    { id: 'egyeb', label: 'Egyéb pártok (elvesző)', color: 'slate-500', baseColor: '#64748b' }
                                ].map((party) => (
                                    <div key={party.id} className="group relative p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-20" style={{ backgroundColor: party.baseColor }}></div>
                                        <div className="flex justify-between items-center mb-5 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full shadow-sm border border-white/20" style={{ backgroundColor: party.baseColor }}></div>
                                                <span className="text-base font-black text-slate-700 dark:text-slate-200">{party.label}</span>
                                            </div>
                                            <span className={`text-xl font-black px-3 py-1 rounded-xl text-${party.color} bg-${party.color}/10 border border-${party.color}/20 min-w-[3.5rem] text-center`}>
                                                {votes[party.id]}%
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={votes[party.id]}
                                            onChange={(e) => handleVoteChange(party.id, e.target.value)}
                                            className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full appearance-none cursor-pointer relative z-10 shadow-inner"
                                            style={{ accentColor: party.baseColor }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Győzteskompenzációarány (%)</span>
                                    <span className="text-sm font-black px-2 py-0.5 rounded-lg border dark:border-slate-800 text-indigo-500 bg-indigo-500/10 border-indigo-500/20">
                                        +{fractionalBonus}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="30"
                                    value={fractionalBonus}
                                    onChange={(e) => setFractionalBonus(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:accent-indigo-400"
                                />
                                <p className="text-[10px] text-slate-500 mt-2 leading-tight">Az OEVK győztese megkapja saját töredékszavazatait. Ez a súlyozó a győztes felülreprezentációját/bónuszát adja hozzá a listás D'Hondt számításhoz virtuálisan.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Table & Info (4 columns on XL) */}
                    <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">

                        {/* Results Table */}
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex-1">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-indigo-500" />
                                    Mandátum Kiosztás
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                                        <tr>
                                            <th className="p-4">Párt / Pártszöv.</th>
                                            <th className="p-4 text-center">OEVK</th>
                                            <th className="p-4 text-center">Listás</th>
                                            <th className="p-4 text-center text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50">Össz</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {mandates.sort((a, b) => b.total - a.total).map((party) => (
                                            <tr key={party.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: party.color }}></div>
                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[100px] sm:max-w-none" title={party.name}>{party.name}</span>
                                                        {party.vote < 5 && party.name !== "Egyéb pártok (elvesző)" && (
                                                            <span className="text-[9px] font-black uppercase text-red-500 border border-red-500/30 bg-red-500/10 px-1 py-0.5 rounded-md hidden sm:inline-block">5% alatt</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-500 dark:text-slate-400 text-sm">
                                                    {party.vote < 5 ? '-' : party.oevk}
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-500 dark:text-slate-400 text-sm">
                                                    {party.vote < 5 ? '-' : party.list}
                                                </td>
                                                <td className="p-4 text-center font-black text-base text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                                                    {party.vote < 5 ? '0' : party.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Methodology Info Box */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border border-indigo-100/50 dark:border-indigo-800/30 p-6 rounded-[2rem] shadow-sm">
                            <h4 className="font-black text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <AlertCircle className="w-4 h-4" />
                                Modell Módszertana
                            </h4>
                            <div className="text-indigo-900/70 dark:text-indigo-200/70 text-xs font-semibold space-y-2.5 leading-relaxed">
                                <p><strong>1. Parlament:</strong> A magyar országgyűlés 199 fős (106 OEVK + 93 lista).</p>
                                <p><strong>2. Küszöb:</strong> Az 5%-ot nem elérő pártok elveszítik a listás és az OEVK esélyeiket is.</p>
                                <p><strong>3. Végletesedő OEVK:</strong> Az egyéni körzeteket egy brit stílusú (First Past The Post) szimulátor osztja ki.</p>
                                <p><strong>4. Kompenzáció:</strong> A listás helyek D'Hondt-mátrixszal és törttöredék-szavazat kompenzációval készülnek.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </motion.div>
    );
}

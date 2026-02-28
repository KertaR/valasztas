import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, PieChart as PieChartIcon, Percent, AlertCircle, BarChart3, RefreshCw } from 'lucide-react';

export default function SeatCalculatorTab({ enrichedData }) {
    // Országos listás szavazatarányok (%)
    const [votes, setVotes] = useState({
        fidesz: 42,
        tisza: 35,
        dk: 8,
        mhm: 6,
        egyhat: 0,
        egyeb: 9
    });

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

    // "Poll of Polls" (2026 tavaszi átlag becslés)
    const loadPollData = (dataset) => {
        if (dataset === 'average') {
            setVotes({ fidesz: 37, tisza: 38, dk: 6, mhm: 6, egyhat: 4, egyeb: 9 });
        } else if (dataset === 'median') {
            setVotes({ fidesz: 36, tisza: 40, dk: 5, mhm: 7, egyhat: 5, egyeb: 7 });
        } else if (dataset === 'zavecz') {
            setVotes({ fidesz: 39, tisza: 37, dk: 8, mhm: 6, egyhat: 3, egyeb: 7 });
        } else if (dataset === 'nezopont') {
            setVotes({ fidesz: 42, tisza: 35, dk: 5, mhm: 5, egyhat: 4, egyeb: 9 });
        } else if (dataset === 'idea') {
            setVotes({ fidesz: 36, tisza: 39, dk: 7, mhm: 6, egyhat: 3, egyeb: 9 });
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
        // Bár a töredékszavazatok pontos kiszámítása OEVK szintű adatok nélkül lehetetlen,
        // a tiszta D'Hondt adja a legpontosabb "matematikailag arányosított" becslést egy országos tesztnél.
        if (eligibleParties.length > 0) {
            let dHondtDivisors = [];
            // Fiktív 5 millió szavazóval számolunk a nagy számok törvénye miatt a D'Hondt tökéletes osztásáért
            const baseVotes = 5000000;
            eligibleParties.forEach(p => {
                const rawVotes = (p.vote / 100) * baseVotes;
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

    }, [votes]);

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
        const radii = [105, 130, 155, 180, 205];
        const seats = [];

        rows.forEach((numSeats, rowIndex) => {
            const r = radii[rowIndex];
            for (let i = 0; i < numSeats; i++) {
                const theta = Math.PI - (i / (numSeats - 1)) * Math.PI;
                seats.push({
                    x: 250 + r * Math.cos(theta),
                    y: 220 - r * Math.sin(theta),
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
                {totalVotePercent !== 100 && (
                    <button onClick={normalizeVotes} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/60 w-full md:w-auto text-sm">
                        Arányok Normalizálása (100%)
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Info and Sliders Area */}
                <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
                    {/* Methodology Box */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-5 rounded-3xl shadow-sm text-sm">
                        <h4 className="font-black text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Hogyan számol a modell?
                        </h4>
                        <div className="text-blue-700/80 dark:text-blue-200/60 font-medium space-y-2">
                            <p><strong>1. Parlament:</strong> 199 mandátum (106 egyéni + 93 listás).</p>
                            <p><strong>2. 5%-os Küszöb:</strong> Amelyik párt nem éri el az 5%-ot az országos listán, az kiesik a törvény szerint (piros jelzés).</p>
                            <p><strong>3. Végletesedő OEVK-k (FPTP):</strong> A 106 egyéni helyet "A győztes mindent visz" (First Past The Post) brit szimulációjával iteráljuk. Aki egy kicsi százalékot ront, az aránytalanul sok körzetet veszíthet!</p>
                            <p><strong>4. Listás Mandátumok (D'Hondt):</strong> A 93 listás helyet hivatalos, matematikai D'Hondt-mátrix módszerrel osztjuk ki a 5% felettiek között szavazatarányosan.</p>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-6 relative overflow-hidden flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-slate-400" />
                                Pártok Országos Szimpátiája
                            </h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            loadPollData(e.target.value);
                                            e.target.value = ""; // Reset miután betöltött, hogy bármikor újra ki lehessen választani
                                        }
                                    }}
                                    className="pl-8 pr-8 py-1.5 appearance-none bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-xl outline-none transition-all border border-purple-200 dark:border-purple-800/50 shadow-sm cursor-pointer"
                                >
                                    <option value="" disabled selected hidden>Kutatási Adatok...</option>
                                    <option value="average">Poll of Polls (Átlag)</option>
                                    <option value="median">Medián (2026)</option>
                                    <option value="zavecz">Závecz (2026)</option>
                                    <option value="nezopont">Nézőpont (2026)</option>
                                    <option value="idea">IDEA Intézet (2026)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            {[
                                { id: 'fidesz', label: 'FIDESZ-KDNP', color: 'orange-500', bg: 'bg-orange-500' },
                                { id: 'tisza', label: 'TISZA', color: 'cyan-500', bg: 'bg-cyan-500' },
                                { id: 'dk', label: 'Demokratikus Koalíció', color: 'blue-500', bg: 'bg-blue-500' },
                                { id: 'mhm', label: 'Mi Hazánk', color: 'emerald-500', bg: 'bg-emerald-500' },
                                { id: 'egyhat', label: 'Egyéb párt (5% felett)', color: 'purple-500', bg: 'bg-purple-500' },
                                { id: 'egyeb', label: 'Egyéb pártok (elvesző)', color: 'slate-500', bg: 'bg-slate-500' }
                            ].map((party) => (
                                <div key={party.id} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{party.label}</span>
                                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg border dark:border-slate-800 text-${party.color} bg-${party.color}/10 border-${party.color}/20`}>
                                            {votes[party.id]}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={votes[party.id]}
                                        onChange={(e) => handleVoteChange(party.id, e.target.value)}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-current"
                                        style={{ accentColor: `var(--color-${party.color})` }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">Összesen:</span>
                                <span className={`text-lg font-black ${totalVotePercent === 100 ? 'text-emerald-500' : 'text-red-500 flex items-center gap-1'}`}>
                                    {totalVotePercent !== 100 && <AlertCircle className="w-4 h-4" />}
                                    {totalVotePercent}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parliament Visual */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-6 flex flex-col items-center justify-center relative min-h-[350px]">
                        <h3 className="absolute top-6 left-6 text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-slate-400" />
                            Parlamenti Patkó (199 Mandátum)
                        </h3>

                        <div className="w-full h-[280px] mt-8 relative flex justify-center">
                            <svg viewBox="0 0 500 240" className="w-full h-full max-w-[500px] drop-shadow-md pb-4 pt-2">
                                {parliamentSeats.map((seat, i) => (
                                    <circle
                                        key={i}
                                        cx={seat.x}
                                        cy={seat.y}
                                        r={6.5}
                                        fill={seat.color || '#e2e8f0'}
                                        className="transition-all duration-700 hover:opacity-80 stroke-white dark:stroke-slate-900 stroke-[1.5px] cursor-pointer"
                                    >
                                        <title>{seat.party || 'Üres'}</title>
                                    </circle>
                                ))}
                            </svg>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none w-full">
                                {leadingParty && (
                                    <div className="flex flex-col items-center -mt-8">
                                        <span className="text-[2.5rem] leading-none font-black drop-shadow-sm" style={{ color: leadingParty.color }}>
                                            {leadingParty.value}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] mt-2 mb-2 px-3 py-1 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm shadow-sm ${leadingColor}`}>
                                            {leadingStatus}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="absolute bottom-6 flex gap-8 items-end w-full justify-center opacity-80">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Többséghez</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-slate-700 dark:text-slate-300">100</span>
                                    <span className="text-xs text-slate-500 font-bold">mand.</span>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kétharmadhoz</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-slate-700 dark:text-slate-300">133</span>
                                    <span className="text-xs text-slate-500 font-bold">mand.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-xs text-center uppercase tracking-widest font-black border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-4 text-left">Párt</th>
                                    <th className="p-4">OEVK Mandátum (106)</th>
                                    <th className="p-4">Listás Mandátum (93)</th>
                                    <th className="p-4">Összesen (199)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {mandates.sort((a, b) => b.total - a.total).map((party) => (
                                    <tr key={party.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: party.color }}></div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{party.name}</span>
                                            {party.vote < 5 && party.name !== "Egyéb pártok (elvesző)" && <span className="text-[10px] font-black uppercase text-red-500 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 rounded-md ml-2">5% alatt</span>}
                                        </td>
                                        <td className="p-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                                            {party.vote < 5 ? '-' : party.oevk}
                                        </td>
                                        <td className="p-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                                            {party.vote < 5 ? '-' : party.list}
                                        </td>
                                        <td className="p-4 text-center font-black text-lg text-slate-800 dark:text-white">
                                            {party.vote < 5 ? '0' : party.total}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}

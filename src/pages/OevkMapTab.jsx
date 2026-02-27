import { useState, useMemo, useRef, useCallback } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// ────────────────────────────────────────────────
// Konstansok
// ────────────────────────────────────────────────
const WIDTH = 800;
const HEIGHT = 520;

// Magyarország közepe Mercator vetítéssel
const BASE_PROJECTION = geoMercator()
    .center([19.3, 47.15])
    .scale(4800)
    .translate([WIDTH / 2, HEIGHT / 2]);

const pathGenerator = geoPath().projection(BASE_PROJECTION);

// ────────────────────────────────────────────────
// Fő komponens
// ────────────────────────────────────────────────
export default function OevkMapTab({ districts, candidates, organizations, oevkPoligonok }) {
    const [selectedParty, setSelectedParty] = useState('all');

    // Zoom/Pan állapot
    const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });
    const svgRef = useRef(null);

    // Tooltip állapot
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, html: '' });

    // ────────────────────────────────────────────────
    // Körzet adatok előkészítése
    // ────────────────────────────────────────────────
    const districtData = useMemo(() => {
        const data = {};
        if (!oevkPoligonok?.features?.length) return data;

        oevkPoligonok.features.forEach(feature => {
            const { maz, evk } = feature.properties;
            const name = `${maz}-${evk}`;
            const mazN = parseInt(maz, 10);
            const evkN = parseInt(evk, 10);

            const district = districts.find(d =>
                parseInt(d.maz, 10) === mazN && parseInt(d.evk, 10) === evkN
            );

            const districtCandidates = candidates.filter(c =>
                parseInt(c.maz, 10) === mazN && parseInt(c.evk, 10) === evkN
            );

            const activeCandidates = districtCandidates.filter(c => {
                const lStat = (c.statusName || '').toLowerCase();
                return !lStat.includes('törölve')
                    && !lStat.includes('elutasítva')
                    && !lStat.includes('visszautasítva')
                    && !lStat.includes('nem kíván');
            });

            const registeredCandidates = activeCandidates.filter(c =>
                c.statusName === 'Nyilvántartásba véve'
            );

            data[name] = {
                name,
                districtInfo: district,
                candidateCount: activeCandidates.length,
                registeredCount: registeredCandidates.length,
                activeCandidates,
                allCandidates: districtCandidates,   // minden jelölt, szűrés nélkül
                battleground: activeCandidates.length >= 8,
            };
        });

        return data;
    }, [districts, candidates, oevkPoligonok]);

    // ────────────────────────────────────────────────
    // Státusz prioritás és színek – azonos a dashboard CandidateStatusChart-tal
    // ────────────────────────────────────────────────
    const getStatusPriority = (statusName) => {
        const sn = statusName || '';
        const sl = sn.toLowerCase();
        if (sn === 'Nyilvántartásba véve') return 7; // jogerős
        if (sl.includes('nyilvántartásba') && sl.includes('nem jogerős')) return 6; // nem jogerős nyilv.
        if (sl.includes('bejelentve') || sl.includes('átvette') || sl.includes('igény') || sl.includes('ismételten')) return 5; // folyamatban
        if (sl.includes('visszautasítva') && sl.includes('nem jogerős')) return 3; // visszautasítva nem jogerős
        if (sl.includes('visszautasítva')) return 2; // visszautasítva jogerős
        if (sl.includes('törölve') || sl.includes('kiesett') || sl.includes('elutasítva') || sl.includes('elveszítette') || sl.includes('lemondott') || sl.includes('elhunyt')) return 1; // törölve/kiesett
        return 4; // egyéb aktív
    };

    const STATUS_COLOR = {
        7: '#14532d', // jogerős – sötétzöld
        6: '#86efac', // nem jogerős nyilv. – világoszöld
        5: '#60a5fa', // folyamatban – kék
        4: '#60a5fa', // egyéb aktív – kék
        3: '#fca5a5', // visszautasítva nem jogerős – halványpiros
        2: '#991b1b', // visszautasítva jogerős – sötétpiros
        1: '#ef4444', // törölve/kiesett – piros
    };

    // ────────────────────────────────────────────────
    // Szín logika
    // ────────────────────────────────────────────────
    const getColor = useCallback((geoName) => {
        const d = districtData[geoName];
        if (!d) return '#e2e8f0';

        if (selectedParty === 'all') {
            if (d.battleground) {
                const count = d.candidateCount;
                if (count >= 12) return '#991b1b';
                if (count === 11) return '#dc2626';
                if (count === 10) return '#ef4444';
                if (count === 9) return '#f87171';
                return '#fca5a5';
            }
            if (d.candidateCount === 0) return '#e2e8f0';
            return '#bae6fd';
        }

        const orgId = parseInt(selectedParty, 10);
        if (isNaN(orgId)) return '#e2e8f0';

        const org = organizations.find(o => o.szkod === orgId);

        // Keressük a párt LEGJOBB státuszú jelöltjét a körzetben
        // (az összes jelöltből, nem csak az aktívakból)
        let bestPriority = 0;

        d.allCandidates.forEach(cand => {
            const isFromParty = cand.jelolo_szervezetek?.includes(orgId)
                || org?.coalitionPartnerIds?.some(pid => cand.jelolo_szervezetek?.includes(pid));
            if (!isFromParty) return;
            const p = getStatusPriority(cand.statusName);
            if (p > bestPriority) bestPriority = p;
        });

        if (bestPriority === 0) return '#f1f5f9'; // nincs jelölt
        return STATUS_COLOR[bestPriority] || '#f1f5f9';
    }, [districtData, selectedParty, organizations, getStatusPriority, STATUS_COLOR]);

    // ────────────────────────────────────────────────
    // SVG path generálás – KÖZVETLENÜL d3-geo-val
    // ────────────────────────────────────────────────
    const paths = useMemo(() => {
        if (!oevkPoligonok?.features?.length) return [];

        return oevkPoligonok.features.map(feature => {
            const d = pathGenerator(feature);
            if (!d) return null;
            const { maz, evk } = feature.properties;
            const name = `${maz}-${evk}`;
            return { d, name, feature };
        }).filter(Boolean);
    }, [oevkPoligonok]);

    // ────────────────────────────────────────────────
    // Zoom / Pan kezelők
    // ────────────────────────────────────────────────
    const clampTransform = (t) => {
        const maxX = WIDTH * (t.k - 1);
        const maxY = HEIGHT * (t.k - 1);
        return {
            k: t.k,
            x: Math.max(-maxX, Math.min(0, t.x)),
            y: Math.max(-maxY, Math.min(0, t.y)),
        };
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        setTransform(prev => {
            const k = Math.max(1, Math.min(8, prev.k * factor));
            // Zoom a kurzor pozíciójára
            const rect = svgRef.current.getBoundingClientRect();
            const mx = ((e.clientX - rect.left) / rect.width) * WIDTH;
            const my = ((e.clientY - rect.top) / rect.height) * HEIGHT;
            const x = mx - (mx - prev.x) * (k / prev.k);
            const y = my - (my - prev.y) * (k / prev.k);
            return clampTransform({ k, x, y });
        });
    };

    const handleMouseDown = (e) => {
        isPanning.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isPanning.current) return;
        const dx = e.clientX - lastPointer.current.x;
        const dy = e.clientY - lastPointer.current.y;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = WIDTH / rect.width;
        const scaleY = HEIGHT / rect.height;
        setTransform(prev => clampTransform({
            k: prev.k,
            x: prev.x + dx * scaleX,
            y: prev.y + dy * scaleY,
        }));
    };

    const handleMouseUp = (e) => {
        isPanning.current = false;
        e.currentTarget.style.cursor = 'grab';
    };

    const zoomIn = () => setTransform(prev => clampTransform({ k: Math.min(8, prev.k * 1.5), x: prev.x, y: prev.y }));
    const zoomOut = () => setTransform(prev => {
        const k = Math.max(1, prev.k / 1.5);
        return clampTransform({ k, x: prev.x * (k / prev.k), y: prev.y * (k / prev.k) });
    });
    const resetZoom = () => setTransform({ k: 1, x: 0, y: 0 });

    // ────────────────────────────────────────────────
    // Tooltip kezelők
    // ────────────────────────────────────────────────
    const handlePathMouseEnter = (e, name) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dInfo = districtData[name];
        let html = `<strong>${dInfo?.districtInfo?.evk_nev || name}</strong><br/>`;
        if (dInfo) {
            if (selectedParty === 'all') {
                html += `Aktív jelöltek: ${dInfo.candidateCount}`;
                if (dInfo.battleground) html += `<br/><span style="color:#ef4444">🔥 Csatatér</span>`;
            } else {
                const orgId = parseInt(selectedParty, 10);
                const cand = dInfo.activeCandidates.find(c => c.jelolo_szervezetek?.includes(orgId));
                html += cand ? `${cand.neve}<br/>${cand.statusName}` : '<em>Nincs jelölt</em>';
            }
        }
        setTooltip({
            visible: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 10,
            html,
        });
    };

    const handlePathMouseLeave = () => setTooltip(t => ({ ...t, visible: false }));

    const handlePathMouseMove = (e) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect || !tooltip.visible) return;
        setTooltip(t => ({ ...t, x: e.clientX - rect.left, y: e.clientY - rect.top - 10 }));
    };

    // ────────────────────────────────────────────────
    // Pártok szűrőhöz
    // ────────────────────────────────────────────────
    // Kizárási feltétel: koalíciós tag vagy Független
    const isExcluded = (org) =>
        org.isCoalitionPartner ||
        (org.r_nev || '').toLowerCase().includes('független');

    // Kiemeltek: top 5 jogerős OEVK-lefedettség szerint
    const featuredParties = organizations
        .filter(org => !isExcluded(org) && org.registeredFinalOevkCoverage > 0)
        .sort((a, b) => b.registeredFinalOevkCoverage - a.registeredFinalOevkCoverage)
        .slice(0, 5);

    const featuredIds = new Set(featuredParties.map(o => o.szkod));

    // Összes többi párt: legalább 1 aktív jelölt, nem kiemelt
    const otherParties = organizations
        .filter(org => !isExcluded(org) && org.candidateCount > 0 && !featuredIds.has(org.szkod))
        .sort((a, b) => b.candidateCount - a.candidateCount);

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            {/* Fejléc */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        OEVK Lefedettség Térkép
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Magyarország {paths.length} egyéni választókerületének vizuális állapota
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedParty}
                        onChange={(e) => setSelectedParty(e.target.value)}
                    >
                        <option value="all">🔥 Összes (Csataterek Célkeresztben)</option>
                        <optgroup label="⭐ Kiemeltek">
                            {featuredParties.map(org => (
                                <option key={org.szkod} value={org.szkod.toString()}>
                                    {org.coalitionAbbr || org.r_nev}
                                    {org.registeredFinalOevkCoverage > 0 ? ` (${org.registeredFinalOevkCoverage} jogerős)` : ''}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="Összes párt">
                            {otherParties.map(org => (
                                <option key={org.szkod} value={org.szkod.toString()}>
                                    {org.coalitionAbbr || org.r_nev}
                                    {org.candidateCount > 0 ? ` (${org.candidateCount} jelölt)` : ''}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Térkép */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 md:p-4 relative select-none">
                    {/* Zoom gombok */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                        <button onClick={zoomIn} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Nagyítás">
                            <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={zoomOut} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Kicsinyítés">
                            <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={resetZoom} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Visszaállítás">
                            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>

                    {/* SVG Térkép */}
                    <div className="relative w-full overflow-hidden rounded-2xl bg-sky-50/40 dark:bg-slate-950/40">
                        <svg
                            ref={svgRef}
                            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                            className="w-full h-auto cursor-grab"
                            style={{ display: 'block' }}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onMouseMove={(e) => { handleMouseMove(e); handlePathMouseMove(e); }}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
                                {paths.length === 0 ? (
                                    <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="#94a3b8" fontSize="18">
                                        Nincs betöltött poligon adat
                                    </text>
                                ) : (
                                    paths.map(({ d, name }) => (
                                        <path
                                            key={name}
                                            d={d}
                                            fill={getColor(name)}
                                            fillRule="evenodd"
                                            stroke="#475569"
                                            strokeWidth={0.5 / transform.k}
                                            strokeLinejoin="round"
                                            onMouseEnter={(e) => handlePathMouseEnter(e, name)}
                                            onMouseLeave={handlePathMouseLeave}
                                            style={{ cursor: 'pointer', transition: 'fill 0.15s ease' }}
                                            className="hover:brightness-90"
                                        />
                                    ))
                                )}
                            </g>
                        </svg>

                        {/* Tooltip */}
                        {tooltip.visible && (
                            <div
                                className="pointer-events-none absolute z-50 bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl max-w-48"
                                style={{
                                    left: Math.min(tooltip.x + 12, (svgRef.current?.clientWidth || 600) - 200),
                                    top: Math.max(tooltip.y - 60, 8),
                                }}
                                dangerouslySetInnerHTML={{ __html: tooltip.html }}
                            />
                        )}
                    </div>

                    {/* Használati utasítás */}
                    <div className="absolute bottom-4 left-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 pointer-events-none">
                        Görgess a nagyításhoz · Húzd a mozgatáshoz
                    </div>
                </div>

                {/* Jelmagyarázat */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Jelmagyarázat</h3>

                        {selectedParty === 'all' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-[#991b1b] border border-red-900 shrink-0" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Extrém csatatér (12+)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-[#ef4444] border border-red-500 shrink-0" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Erős csatatér (10-11)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-[#fca5a5] border border-red-400 shrink-0" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Kezdődő csatatér (8-9)</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div className="w-5 h-5 rounded bg-blue-200 border border-blue-300 shrink-0" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Átlagos körzet</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-slate-200 border border-slate-300 shrink-0" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nincs adat</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-[#14532d] border border-green-950 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Jogerős jelölt</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-[#86efac] border border-green-300 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Nyilv. véve (nem jogerős)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-[#60a5fa] border border-blue-400 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Folyamatban / Bejelentve</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-[#fca5a5] border border-red-300 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Visszautasítva (nem jogerős)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-[#991b1b] border border-red-900 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Visszautasítva (jogerős)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-[#ef4444] border border-red-500 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Törölve / Kiesett</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Nincs jelölt (fehér folt)</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                A térkép a pártok területi lefedettségét mutatja. A fehér foltok komoly stratégiai hátrányt jelenthetnek!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

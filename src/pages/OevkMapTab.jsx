import { useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// ────────────────────────────────────────────────
// Fő komponens
// ────────────────────────────────────────────────
export default function OevkMapTab({ districts, candidates, organizations, oevkPoligonok }) {
    const [selectedParty, setSelectedParty] = useState('all');

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
    // Tooltip kezelők
    // ────────────────────────────────────────────────
    const handlePathMouseEnter = (e, name) => {
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
            x: e.clientX,
            y: e.clientY - 10,
            html,
        });
    };

    const handlePathMouseLeave = () => setTooltip(t => ({ ...t, visible: false }));

    const handlePathMouseMove = (e) => {
        if (!tooltip.visible) return;
        setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY - 10 }));
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
                        Magyarország 106 egyéni választókerületének vizuális állapota
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
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 md:p-4 select-none" style={{ position: 'relative' }}>
                    {/* Leaflet MapContainer */}
                    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl bg-sky-50/40 dark:bg-slate-950/40 z-0 map-wrapper">
                        <MapContainer center={[47.16, 19.5]} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {oevkPoligonok?.features && (
                                <GeoJSON
                                    key={selectedParty}
                                    data={oevkPoligonok}
                                    style={(feature) => {
                                        const geoName = `${feature.properties.maz}-${feature.properties.evk}`;
                                        return {
                                            fillColor: getColor(geoName),
                                            weight: 1.5,
                                            opacity: 0.8,
                                            color: '#334155', // slate-700
                                            fillOpacity: 0.5 // Átlátszóság hozzáadva!
                                        };
                                    }}
                                    onEachFeature={(feature, layer) => {
                                        const geoName = `${feature.properties.maz}-${feature.properties.evk}`;

                                        layer.on({
                                            mouseover: (e) => {
                                                const lay = e.target;
                                                lay.setStyle({ fillOpacity: 0.8 });
                                                handlePathMouseEnter(e.originalEvent, geoName);
                                            },
                                            mouseout: (e) => {
                                                const lay = e.target;
                                                lay.setStyle({ fillOpacity: 0.5 });
                                                handlePathMouseLeave();
                                            },
                                            mousemove: (e) => {
                                                handlePathMouseMove(e.originalEvent);
                                            }
                                        });
                                    }}
                                />
                            )}
                        </MapContainer>

                        {/* Tooltip */}
                        {tooltip.visible && (
                            <div
                                className="pointer-events-none fixed z-[9999] bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl max-w-48"
                                style={{
                                    left: tooltip.x + 15,
                                    top: Math.max(tooltip.y - 15, 8),
                                }}
                                dangerouslySetInnerHTML={{ __html: tooltip.html }}
                            />
                        )}
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

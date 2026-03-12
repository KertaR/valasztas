import { useState, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin } from 'lucide-react';
import { useDataContext } from '../contexts';

import MapSearchBar from '../components/map/MapSearchBar';
import MapDisplay from '../components/map/MapDisplay';
import MapSidebarInfo from '../components/map/MapSidebarInfo';
import MapLegend from '../components/map/MapLegend';

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
// Fő komponens
// ────────────────────────────────────────────────
export default function OevkMapTab() {
    const { enrichedData } = useDataContext();
    const { districts, candidates, organizations, oevkPoligonok } = enrichedData || {};

    const [selectedParty, setSelectedParty] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    // Keresés Állapotai
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [mapCenter, setMapCenter] = useState(null); // [lat, lng]

    // Tooltip állapot és ref
    const [tooltipContent, setTooltipContent] = useState(null); // null vagy { html, x, y }
    const tooltipRef = useRef(null);

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
    }, [districtData, selectedParty, organizations]);

    // ────────────────────────────────────────────────
    // Tooltip kezelők
    // ────────────────────────────────────────────────
    const handlePathMouseEnter = useCallback((e, name) => {
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
        setTooltipContent({
            x: e.clientX,
            y: e.clientY,
            html,
        });
    }, [districtData, selectedParty]);

    const handlePathMouseLeave = useCallback(() => setTooltipContent(null), []);

    const handlePathMouseMove = useCallback((e) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.left = `${e.clientX + 15}px`;
            tooltipRef.current.style.top = `${Math.max(e.clientY + 15, 8)}px`;
        }
    }, []);

    // ────────────────────────────────────────────────
    // Pártok szűrőhöz
    // ────────────────────────────────────────────────
    // Kizárási feltétel: koalíciós tag vagy Független
    const isExcluded = (org) =>
        org.isCoalitionPartner ||
        (org.r_nev || '').toLowerCase().includes('független');

    // Kiemeltek: top 5 jogerős OEVK-lefedettség szerint
    const featuredParties = organizations
        .filter(org => !isExcluded(org) && org.registeredOevkCoverage > 0)
        .sort((a, b) => b.registeredOevkCoverage - a.registeredOevkCoverage)
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
            {/* Fejléc és Szűrők */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        OEVK Lefedettség Térkép
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                        Magyarország 106 egyéni választókerületének vizuális állapota
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
                    <MapSearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isSearching={isSearching}
                        setIsSearching={setIsSearching}
                        searchError={searchError}
                        setSearchError={setSearchError}
                        oevkPoligonok={oevkPoligonok}
                        setSelectedDistrict={setSelectedDistrict}
                        setMapCenter={setMapCenter}
                    />

                    <select
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto transition-all"
                        value={selectedParty}
                        onChange={(e) => setSelectedParty(e.target.value)}
                    >
                        <option value="all">🔥 Összes (Csataterek Célkeresztben)</option>
                        <optgroup label="⭐ Kiemeltek">
                            {featuredParties.map(org => (
                                <option key={org.szkod} value={org.szkod.toString()}>
                                    {org.coalitionAbbr || org.r_nev}
                                    {org.registeredOevkCoverage > 0 ? ` (${org.registeredOevkCoverage} nyilvántartva)` : ''}
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

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Térkép Container */}
                <div className="xl:col-span-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 p-2 select-none relative h-[500px] md:h-[650px]">
                    <MapDisplay
                        oevkPoligonok={oevkPoligonok}
                        selectedParty={selectedParty}
                        selectedDistrict={selectedDistrict}
                        mapCenter={mapCenter}
                        getColor={getColor}
                        handlePathMouseEnter={handlePathMouseEnter}
                        handlePathMouseLeave={handlePathMouseLeave}
                        handlePathMouseMove={handlePathMouseMove}
                        setSelectedDistrict={setSelectedDistrict}
                        tooltip={tooltipContent}
                    />
                </div>

                {/* Oldalsáv és Jelmagyarázat */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                    {selectedDistrict && (
                        <MapSidebarInfo
                            selectedDistrict={selectedDistrict}
                            districtData={districtData}
                            selectedParty={selectedParty}
                            organizations={organizations}
                            onClose={() => setSelectedDistrict(null)}
                        />
                    )}
                    
                    <MapLegend selectedParty={selectedParty} />
                </div>
            </div>

            {/* Tooltip renderálása a React Portal segítségével a document.body-ba */}
            {tooltipContent && createPortal(
                <div
                    ref={tooltipRef}
                    className="pointer-events-none fixed z-[9999] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 text-sm px-4 py-3 rounded-2xl shadow-2xl max-w-[250px]"
                    style={{
                        left: tooltipContent.x + 15,
                        top: Math.max(tooltipContent.y + 15, 8),
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: tooltipContent.html }} />
                </div>,
                document.body
            )}
        </div>
    );
}

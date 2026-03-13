import { NVIJelolt, NVISzervezet, NVIOevk } from '../../types/nvi';
import { EnrichedCandidate, CountyStats } from '../../types/app';
import { STATUS_MAP } from '../constants';

export const isExcludedStatus = (statusName: string | null): boolean => {
    if (!statusName) return false;
    const lower = statusName.toLowerCase();
    return lower.includes('törölve') ||
        lower.includes('elutasítva') ||
        lower.includes('visszautasítva') ||
        lower.includes('kiesett') ||
        lower.includes('visszalépett') ||
        lower.includes('visszavon') ||
        lower.includes('nem kíván') ||
        lower.includes('megszűnt');
};

interface ProcessCandidatesArgs {
    data: {
        jeloltek: NVIJelolt[] | null;
    };
    yesterdayData?: {
        jeloltek: NVIJelolt[] | null;
    } | null;
    statusMap: Record<string, string>;
    distMap: Record<string, NVIOevk>;
    countyMap: Record<string, string>;
    orgMap: Record<string | number, NVISzervezet>;
    yesterdayJeloltSet: Set<string>;
    yesterdayJeloltStatusMap: Record<string, string>;
    partyCounts: Record<string, number>;
    countyCounts: Record<string, number>;
    oevkCandidateCounts: Record<string, number>;
    countyStatsObj: Record<string, CountyStats>;
}

export const processCandidates = ({
    data,
    yesterdayData,
    statusMap,
    distMap,
    countyMap,
    orgMap,
    yesterdayJeloltSet,
    yesterdayJeloltStatusMap,
    partyCounts,
    countyCounts,
    oevkCandidateCounts,
    countyStatsObj
}: ProcessCandidatesArgs) => {
    const processedCandIds = new Set<string>();
    
    const allCandidates: EnrichedCandidate[] = (data.jeloltek || []).map(candidate => {
        const candId = String(candidate.ej_id || candidate.szj || `${candidate.maz}-${candidate.evk}-${candidate.neve}`);

        if (processedCandIds.has(candId)) return null;
        processedCandIds.add(candId);

        const statusName = statusMap[candidate.allapot] || `Ismeretlen kód: ${candidate.allapot}`;
        const isExcluded = isExcludedStatus(statusName);

        const districtKey = `${candidate.maz}-${candidate.evk}`;
        const district = distMap[districtKey];
        const countyName = countyMap[candidate.maz] || `Ismeretlen megye (${candidate.maz})`;

        let partyNames = 'Független';
        if (candidate.jelolo_szervezetek && candidate.jelolo_szervezetek.length > 0) {
            const names = candidate.jelolo_szervezetek
                .map(id => orgMap[id]?.r_nev || orgMap[id]?.nev)
                .filter(Boolean);
            if (names.length > 0) {
                partyNames = names.join('-');
            }
        } else if (candidate.jlcs_nev && candidate.jlcs_nev.trim()) {
            partyNames = candidate.jlcs_nev;
        }

        if (!isExcluded) {
            partyCounts[partyNames] = (partyCounts[partyNames] || 0) + 1;
            countyCounts[countyName] = (countyCounts[countyName] || 0) + 1;
            oevkCandidateCounts[districtKey] = (oevkCandidateCounts[districtKey] || 0) + 1;
            if (countyStatsObj[candidate.maz]) countyStatsObj[candidate.maz].candidateCount++;
        }

        const isNew = !!(yesterdayData && candId && !yesterdayJeloltSet.has(candId));
        const oldStatusName = yesterdayData && candId && yesterdayJeloltStatusMap[candId] ? yesterdayJeloltStatusMap[candId] : null;
        const hasStatusChanged = !!(oldStatusName && oldStatusName !== statusName);

        return {
            ...candidate,
            statusName,
            districtName: district ? district.evk_nev : `Ismeretlen OEVK (${districtKey})`,
            countyName,
            partyNames,
            isNew,
            oldStatusName,
            hasStatusChanged,
            isExcluded
        };
    }).filter((c): c is EnrichedCandidate => c !== null);

    const candidates = allCandidates.filter(c => !c.isExcluded);

    // Get removed candidates
    const todayCandIdSet = new Set(allCandidates.map(c => String(c.ej_id || c.szj)));

    const goneCandidates: EnrichedCandidate[] = yesterdayData && yesterdayData.jeloltek ? yesterdayData.jeloltek.filter(c => {
        const id = String(c.ej_id || c.szj);
        return !todayCandIdSet.has(id);
    }).map(c => ({
        ...c,
        statusName: yesterdayJeloltStatusMap[String(c.ej_id || c.szj)] || 'Ismeretlen',
        removalReason: 'Eltűnt az adatbázisból',
        isRemoved: true,
        districtName: '', // Fallback for required fields in EnrichedCandidate if missing in raw
        countyName: '',
        partyNames: '',
        isNew: false,
        oldStatusName: null,
        hasStatusChanged: false,
        isExcluded: true
    })) : [];

    const newlyExcludedCandidates: EnrichedCandidate[] = allCandidates.filter(c => {
        if (!c.isExcluded) return false;
        if (!c.hasStatusChanged) return false;
        const oldStatus = c.oldStatusName;
        if (!oldStatus) return false;
        return !isExcludedStatus(oldStatus);
    }).map(c => ({
        ...c,
        removalReason: `Státusz: ${c.oldStatusName} → ${c.statusName}`,
        isRemoved: true
    }));

    const removedCandidates = [...goneCandidates, ...newlyExcludedCandidates];

    return { allCandidates, candidates, removedCandidates };
};

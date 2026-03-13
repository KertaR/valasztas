import { useMemo } from 'react';
import { STATUS_MAP } from '../utils/constants';

import { processCandidates, isExcludedStatus } from '../utils/transformers/candidateTransformer';
import { processOrganizations } from '../utils/transformers/organizationTransformer';
import { processOevkPolygons } from '../utils/transformers/mapTransformer';
import { calculateFormationsProgress, generateStats } from '../utils/transformers/statsTransformer';

import { ElectionDataState, YesterdayDataState } from './useElectionData';
import { NVIMegye, NVIOevk, NVISzervezet } from '../types/nvi';
import { CountyStats, EnrichedDistrict } from '../types/app';

export function useEnrichedData(data: ElectionDataState, yesterdayData: YesterdayDataState | null, isAllUploaded: boolean) {
    return useMemo(() => {
        if (!isAllUploaded) return { candidates: [], districts: [], organizations: [], countiesData: [], settlements: [], stats: {} as any };

        const statusMap = STATUS_MAP as Record<string, string>;

        const orgMap: Record<string | number, NVISzervezet> = {};
        if (data.szervezetek) {
            data.szervezetek.forEach(org => orgMap[org.szkod] = org);
        }

        const distMap: Record<string, NVIOevk> = {};
        const countyMap: Record<string, string> = {};
        const countyStatsObj: Record<string, CountyStats> = {};
        let totalEligibleVoters = 0;

        if (data.megyek) {
            data.megyek.forEach((megye: NVIMegye) => {
                countyMap[megye.leiro.maz] = megye.leiro.nev;
            });
        }

        if (data.oevk) {
            data.oevk.forEach((dist: NVIOevk) => {
                const key = `${dist.maz}-${dist.evk}`;
                distMap[key] = dist;
                if (!countyMap[dist.maz] && dist.maz_nev) {
                    countyMap[dist.maz] = dist.maz_nev;
                }
                totalEligibleVoters += (dist.letszam?.indulo || 0);

                if (!countyStatsObj[dist.maz]) {
                    countyStatsObj[dist.maz] = { id: dist.maz, nev: countyMap[dist.maz] || `Megye (${dist.maz})`, oevkCount: 0, voterCount: 0, candidateCount: 0 };
                }
                countyStatsObj[dist.maz].oevkCount++;
                countyStatsObj[dist.maz].voterCount += (dist.letszam?.indulo || 0);
            });
        }

        const yesterdayJeloltSet = new Set(yesterdayData?.jeloltek?.map(c => String(c.ej_id || c.szj)) || []);
        const yesterdayOrgSet = new Set(yesterdayData?.szervezetek?.map(o => String(o.szkod)) || []);

        const yesterdayJeloltStatusMap: Record<string, string> = {};
        if (yesterdayData && yesterdayData.jeloltek) {
            yesterdayData.jeloltek.forEach(c => {
                yesterdayJeloltStatusMap[String(c.ej_id || c.szj)] = statusMap[c.allapot] || `Ismeretlen kód: ${c.allapot}`;
            });
        }

        const partyCounts: Record<string, number> = {};
        const statusCounts: Record<string, number> = {};
        const countyCounts: Record<string, number> = {};
        const oevkCandidateCounts: Record<string, number> = {};
        const statusCategories = {
            registered: 0,
            registered_pre: 0,
            pending: 0,
            not_starting: 0,
            deleted: 0,
            visszautasitva_pre: 0,
            visszautasitva_final: 0
        };

        (data.jeloltek || []).forEach(candidate => {
            const statusName = statusMap[candidate.allapot] || `Ismeretlen kód: ${candidate.allapot}`;
            statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;

            const lowerStatus = statusName.toLowerCase();
            if (statusName === 'Nyilvántartásba véve') {
                statusCategories.registered++;
            } else if (lowerStatus.includes('visszautasítva') && lowerStatus.includes('nem jogerős')) {
                statusCategories.visszautasitva_pre++;
            } else if (lowerStatus.includes('visszautasítva')) {
                statusCategories.visszautasitva_final++;
            } else if (lowerStatus.includes('nem jogerős')) {
                statusCategories.registered_pre++;
            } else if (lowerStatus === 'nem kíván indulni') {
                statusCategories.not_starting++;
            } else if (lowerStatus.includes('törölve') || lowerStatus.includes('elutasítva') || lowerStatus.includes('kiesett') || lowerStatus.includes('visszalépett') || lowerStatus.includes('visszavon')) {
                statusCategories.deleted++;
            } else {
                statusCategories.pending++;
            }
        });

        const { allCandidates, candidates, removedCandidates } = processCandidates({
            data: { jeloltek: data.jeloltek },
            yesterdayData: { jeloltek: yesterdayData?.jeloltek || null },
            statusMap, distMap, countyMap, orgMap,
            yesterdayJeloltSet, yesterdayJeloltStatusMap, partyCounts,
            countyCounts, oevkCandidateCounts, countyStatsObj
        });

        const organizations = processOrganizations({
            data: { szervezetek: data.szervezetek, listakEsJeloltek: data.listakEsJeloltek },
            yesterdayData: { szervezetek: yesterdayData?.szervezetek || null },
            candidates, orgMap, statusMap, yesterdayOrgSet
        });

        const yesterdayDistMap: Record<string, NVIOevk> = {};
        if (yesterdayData && yesterdayData.oevk) {
            yesterdayData.oevk.forEach(dist => {
                yesterdayDistMap[`${dist.maz}-${dist.evk}`] = dist;
            });
        }

        const districts: EnrichedDistrict[] = (data.oevk || []).map(dist => {
            const key = `${dist.maz}-${dist.evk}`;
            const yDist = yesterdayDistMap[key];

            const kulkep = dist.letszam?.kuvi || dist.letszam?.kulkep || 0;
            const atjel = dist.letszam?.atjel || dist.letszam?.atjelentkezo || 0;
            const atjelInnen = dist.letszam?.atjelInnen || 0;

            let kulkepDiff = 0;
            let atjelDiff = 0;
            let atjelInnenDiff = 0;
            let totalDiff = 0;

            if (yDist) {
                const yKulkep = yDist.letszam?.kuvi || yDist.letszam?.kulkep || 0;
                const yAtjel = yDist.letszam?.atjel || yDist.letszam?.atjelentkezo || 0;
                const yAtjelInnen = yDist.letszam?.atjelInnen || 0;
                kulkepDiff = kulkep - yKulkep;
                atjelDiff = atjel - yAtjel;
                atjelInnenDiff = atjelInnen - yAtjelInnen;
                totalDiff = (kulkep + atjel) - (yKulkep + yAtjel);
            }

            return {
                ...dist,
                candidateCount: oevkCandidateCounts[key] || 0,
                kulkepDiff,
                atjelDiff,
                atjelInnenDiff,
                totalDiff
            };
        }).sort((a, b) => b.candidateCount - a.candidateCount);

        const formationsProgress = calculateFormationsProgress(candidates, orgMap);
        const stats = generateStats({
            partyCounts, organizations, statusCounts, statusCategories,
            countyCounts, countyStatsObj, districts, candidates, allCandidates,
            totalEligibleVoters, yesterdayData, statusMap, isExcludedStatus
        });

        const oevkPoligonok = processOevkPolygons(data.oevkPoligonok);

        return {
            allCandidates, candidates, districts, organizations,
            countiesData: Object.values(countyStatsObj).sort((a, b) => b.candidateCount - a.candidateCount),
            formationsProgress, removedCandidates,
            settlements: data.telepulesek || [], oevkPoligonok, stats
        };
    }, [data, yesterdayData, isAllUploaded]);
}

import { NVISzervezet, NVIJelolt } from '../../types/nvi';
import { EnrichedCandidate, EnrichedOrganization } from '../../types/app';
import { processCoalitions } from '../dataHelpers';

interface ProcessOrganizationsArgs {
    data: {
        szervezetek: NVISzervezet[] | null;
        listakEsJeloltek?: any[] | null;
    };
    yesterdayData?: {
        szervezetek: NVISzervezet[] | null;
    } | null;
    candidates: EnrichedCandidate[];
    orgMap: Record<string | number, NVISzervezet>;
    statusMap: Record<string, string>;
    yesterdayOrgSet: Set<string>;
}

export interface Alliance {
    szkod: number;
    count: number;
    name: string;
    abbr: string;
}

export interface NationalListCandidate extends NVIJelolt {
    statusName: string;
    sorsz?: number;
}

export interface EnrichedOrgWithStats extends EnrichedOrganization {
    registeredCandidateCount: number;
    registeredFinalCount: number;
    registeredPreCount: number;
    oevkCoverage: number;
    registeredOevkCoverage: number;
    registeredCountiesCount: number;
    registeredFinalOevkCoverage: number;
    registeredFinalCountiesCount: number;
    coveragePercent: number;
    registeredCoveragePercent: number;
    registeredFinalCoveragePercent: number;
    alliances: Alliance[];
    candidateList: EnrichedCandidate[];
    nationalListStatus: string | null;
    nationalListCandidates: NationalListCandidate[];
}

export const processOrganizations = ({
    data,
    yesterdayData,
    candidates,
    orgMap,
    statusMap,
    yesterdayOrgSet
}: ProcessOrganizationsArgs): EnrichedOrgWithStats[] => {
    const TOTAL_OEVK = 106;
    let organizations: EnrichedOrgWithStats[] = (data.szervezetek || [])
        .sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu'))
        .map(org => {
            const orgCandidates = org.szkod === 0
                ? candidates.filter(c => !c.jelolo_szervezetek || c.jelolo_szervezetek.length === 0)
                : candidates.filter(c => c.jelolo_szervezetek && c.jelolo_szervezetek.includes(org.szkod));

            const registeredCandidates = orgCandidates.filter(c =>
                c.statusName.startsWith('Nyilvántartásba véve')
            );

            const registeredFinalCandidates = orgCandidates.filter(c =>
                c.statusName === 'Nyilvántartásba véve' ||
                (c.statusName.startsWith('Nyilvántartásba') && c.statusName.includes('jogerős') && !c.statusName.includes('nem jogerős'))
            );

            const registeredFinalCount = registeredFinalCandidates.length;

            const registeredPreCount = orgCandidates.filter(c =>
                c.statusName.startsWith('Nyilvántartásba') && c.statusName.includes('nem jogerős')
            ).length;

            const uniqueOevks = new Set(orgCandidates.map(c => `${c.maz}-${c.evk}`));
            const registeredOevks = new Set(registeredCandidates.map(c => `${c.maz}-${c.evk}`));
            const registeredCounties = new Set(registeredCandidates.map(c => c.maz));

            const registeredFinalOevks = new Set(registeredFinalCandidates.map(c => `${c.maz}-${c.evk}`));
            const registeredFinalCounties = new Set(registeredFinalCandidates.map(c => c.maz));

            const orgId = String(org.szkod);
            const isNew = !!(yesterdayData && orgId && !yesterdayOrgSet.has(orgId));

            const partnerCounts: Record<string, number> = {};
            orgCandidates.forEach(c => {
                if (c.jelolo_szervezetek) {
                    c.jelolo_szervezetek.forEach(id => {
                        if (id !== org.szkod) partnerCounts[id] = (partnerCounts[id] || 0) + 1;
                    });
                }
            });

            const alliances: Alliance[] = Object.entries(partnerCounts)
                .map(([id, count]) => ({
                    szkod: parseInt(id),
                    count,
                    name: orgMap[id]?.nev || 'Ismeretlen',
                    abbr: orgMap[id]?.r_nev || orgMap[id]?.nev || '?'
                }))
                .sort((a, b) => b.count - a.count);

            let nationalListStatus: string | null = null;
            let nationalListCandidates: NationalListCandidate[] = [];
            if (data.listakEsJeloltek) {
                const orgListInfo = data.listakEsJeloltek.find(l => l.jelolo_szervezetek && l.jelolo_szervezetek.includes(org.szkod) && (l.lista_tip === 'O' || l.lista_tip === 'K'));
                if (orgListInfo) {
                    nationalListStatus = statusMap[orgListInfo.allapot] || 'Bejelentve';
                    nationalListCandidates = (orgListInfo.jeloltek || []).map((c: any) => ({
                        ...c,
                        statusName: statusMap[c.allapot] || 'Bejelentve'
                    })).sort((a: any, b: any) => (a.sorsz || 0) - (b.sorsz || 0));
                }
            }

            return {
                ...org,
                candidateCount: orgCandidates.length,
                registeredCandidateCount: registeredCandidates.length,
                registeredFinalCount,
                registeredPreCount,
                oevkCoverage: uniqueOevks.size,
                registeredOevkCoverage: registeredOevks.size,
                registeredCountiesCount: registeredCounties.size,
                registeredFinalOevkCoverage: registeredFinalOevks.size,
                registeredFinalCountiesCount: registeredFinalCounties.size,
                coveragePercent: Math.round((uniqueOevks.size / TOTAL_OEVK) * 100),
                registeredCoveragePercent: Math.round((registeredOevks.size / TOTAL_OEVK) * 100),
                registeredFinalCoveragePercent: Math.round((registeredFinalOevks.size / TOTAL_OEVK) * 100),
                isNew,
                alliances,
                candidateList: orgCandidates,
                nationalListStatus,
                nationalListCandidates,
                isCoalitionPartner: false // Will be set by processCoalitions
            };
        }).sort((a, b) => b.candidateCount - a.candidateCount);

    return processCoalitions(organizations);
};

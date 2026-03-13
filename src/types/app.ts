import { NVIJelolt, NVISzervezet, NVIOevk } from './nvi';

export interface EnrichedCandidate extends NVIJelolt {
    statusName: string;
    districtName: string;
    countyName: string;
    partyNames: string;
    isNew: boolean;
    oldStatusName: string | null;
    hasStatusChanged: boolean;
    isExcluded: boolean;
    isRemoved?: boolean;
    removalReason?: string;
}

export interface EnrichedOrganization extends NVISzervezet {
    candidateCount: number;
    isCoalitionPartner: boolean;
    coalitionFullName?: string;
    coalitionAbbr?: string;
    members?: string[];
    isNew: boolean;
}

export interface EnrichedDistrict extends NVIOevk {
    candidateCount: number;
    kulkepDiff: number;
    atjelDiff: number;
    atjelInnenDiff: number;
    totalDiff: number;
}

export interface CountyStats {
    id: string;
    nev: string;
    oevkCount: number;
    voterCount: number;
    candidateCount: number;
}

export interface ElectionStats {
    totalEligibleVoters: number;
    statusCategories: Record<string, number>;
    statusBreakdown: Record<string, number>;
    partyCounts: Record<string, number>;
    countyCounts: Record<string, number>;
    recentUpdates: any[];
    mostContestedOevk: EnrichedDistrict | null;
    diffs?: {
        candidates: number;
        organizations: number;
        districts: number;
        voters: number;
    };
}

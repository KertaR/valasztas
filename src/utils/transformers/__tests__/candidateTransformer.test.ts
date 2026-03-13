import { describe, it, expect } from 'vitest';
import { isExcludedStatus, processCandidates } from '../candidateTransformer';

describe('candidateTransformer', () => {
    describe('isExcludedStatus', () => {
        it('should return true for excluded statuses', () => {
            expect(isExcludedStatus('Törölve')).toBe(true);
            expect(isExcludedStatus('visszalépett')).toBe(true);
            expect(isExcludedStatus('Nem kíván indulni')).toBe(true);
            expect(isExcludedStatus('Kiesett')).toBe(true);
        });

        it('should return false for active statuses', () => {
            expect(isExcludedStatus('Nyilvántartásba véve')).toBe(false);
            expect(isExcludedStatus('Bejelentve')).toBe(false);
            expect(isExcludedStatus(null)).toBe(false);
        });
    });

    describe('processCandidates', () => {
        const mockData = {
            jeloltek: [
                { ej_id: '1', neve: 'Teszt Elek', maz: '01', evk: '01', allapot: '1', jelolo_szervezetek: ['101'] },
                { ej_id: '2', neve: 'Sample John', maz: '01', evk: '01', allapot: '6', jelolo_szervezetek: [] }
            ]
        };
        const mockOrgMap = {
            '101': { r_nev: 'Párt A', nev: 'Párt Alapítvány' }
        };
        const mockDistMap = {
            '01-01': { evk_nev: 'Budapest 1. körzet' }
        };
        const mockCountyMap = {
            '01': 'Budapest'
        };
        const mockStatusMap = {
            '1': 'Nyilvántartásba véve',
            '6': 'Törölve'
        };

        it('should correctly process and filter candidates', () => {
            const partyCounts = {};
            const countyCounts = {};
            const oevkCandidateCounts = {};
            const countyStatsObj = { '01': { candidateCount: 0 } };

            const result = processCandidates({
                data: mockData,
                statusMap: mockStatusMap,
                distMap: mockDistMap,
                countyMap: mockCountyMap,
                orgMap: mockOrgMap,
                yesterdayJeloltSet: new Set(),
                yesterdayJeloltStatusMap: {},
                partyCounts,
                countyCounts,
                oevkCandidateCounts,
                countyStatsObj
            });

            expect(result.allCandidates).toHaveLength(2);
            expect(result.candidates).toHaveLength(1);
            expect(result.candidates[0].neve).toBe('Teszt Elek');
            expect(result.candidates[0].partyNames).toBe('Párt A');
            expect(result.candidates[0].isExcluded).toBe(false);
            expect(result.allCandidates[1].isExcluded).toBe(true);
            
            expect(partyCounts['Párt A']).toBe(1);
            expect(countyCounts['Budapest']).toBe(1);
            expect(oevkCandidateCounts['01-01']).toBe(1);
            expect(countyStatsObj['01'].candidateCount).toBe(1);
        });
    });
});

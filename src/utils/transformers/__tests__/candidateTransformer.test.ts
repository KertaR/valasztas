import { describe, it, expect } from 'vitest';
import { isExcludedStatus, processCandidates } from '../candidateTransformer';
import { NVIOevk, NVISzervezet } from '../../../types/nvi';
import { CountyStats } from '../../../types/app';

describe('candidateTransformer', () => {
    describe('isExcludedStatus', () => {
        it('should return true for excluded statuses', () => {
            expect(isExcludedStatus('Szervezet által törölve (nem jogerős)')).toBe(true);
            expect(isExcludedStatus('Visszalépett (nem jogerős)')).toBe(true);
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
                { ej_id: 1, neve: 'Jelölt 1', maz: '01', evk: '01', allapot: '1', jelolo_szervezetek: [101] },
                { ej_id: 2, neve: 'Jelölt 2', maz: '01', evk: '01', allapot: '2' }
            ]
        } as any;

        it('should correctly process and filter candidates', () => {
            const partyCounts: Record<string, number> = {};
            const countyCounts: Record<string, number> = {};
            const oevkCandidateCounts: Record<string, number> = {};
            const countyStatsObj: Record<string, CountyStats> = {
                '01': { id: '01', nev: 'Budapest', oevkCount: 1, voterCount: 100, candidateCount: 0 }
            };

            const result = processCandidates({
                data: mockData,
                statusMap: { '1': 'Nyilvántartásba véve', '2': 'Kiesett' },
                distMap: { '01-01': { maz: '01', evk: '01', evk_nev: 'Körzet 1' } as NVIOevk },
                countyMap: { '01': 'Budapest' },
                orgMap: { 101: { szkod: 101, nev: 'Szervezet 1', r_nev: 'SZ1' } as NVISzervezet },
                yesterdayJeloltSet: new Set(),
                yesterdayJeloltStatusMap: {},
                partyCounts,
                countyCounts,
                oevkCandidateCounts,
                countyStatsObj
            });

            expect(result.candidates.length).toBe(1);
            expect(result.candidates[0].neve).toBe('Jelölt 1');
            expect(result.candidates[0].statusName).toBe('Nyilvántartásba véve');
            expect(result.candidates[0].isExcluded).toBe(false);

            expect(result.allCandidates.length).toBe(2);
            expect(result.allCandidates[1].isExcluded).toBe(true);

            expect(partyCounts['SZ1']).toBe(1);
            expect(countyCounts['Budapest']).toBe(1);
            expect(oevkCandidateCounts['01-01']).toBe(1);
        });
    });
});

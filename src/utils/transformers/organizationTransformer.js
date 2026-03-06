import { processCoalitions } from '../dataHelpers';

export const processOrganizations = ({
    data,
    yesterdayData,
    candidates,
    orgMap,
    statusMap,
    yesterdayOrgSet
}) => {
    const TOTAL_OEVK = 106;
    let organizations = (data.szervezetek || [])
        .sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu')) // Stabil sorrend a koalícióknál
        .map(org => {
            const orgCandidates = org.szkod === 0
                ? candidates.filter(c => !c.jelolo_szervezetek || c.jelolo_szervezetek.length === 0)
                : candidates.filter(c => c.jelolo_szervezetek && c.jelolo_szervezetek.includes(org.szkod));

            // Belevesszük a jogerős és a nem jogerős nyilvántartásba vételt is
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

            const partnerCounts = {};
            orgCandidates.forEach(c => {
                if (c.jelolo_szervezetek) {
                    c.jelolo_szervezetek.forEach(id => {
                        if (id !== org.szkod) partnerCounts[id] = (partnerCounts[id] || 0) + 1;
                    });
                }
            });

            const alliances = Object.entries(partnerCounts)
                .map(([id, count]) => ({
                    szkod: parseInt(id),
                    count,
                    name: orgMap[id]?.nev || 'Ismeretlen',
                    abbr: orgMap[id]?.r_nev || orgMap[id]?.nev || '?'
                }))
                .sort((a, b) => b.count - a.count);

            // Országos lista ellenőrzés
            let nationalListStatus = null;
            let nationalListCandidates = [];
            if (data.listakEsJeloltek) {
                const orgListInfo = data.listakEsJeloltek.find(l => l.jelolo_szervezetek && l.jelolo_szervezetek.includes(org.szkod) && l.lista_tip === 'O');
                if (orgListInfo) {
                    nationalListStatus = statusMap[orgListInfo.allapot] || 'Bejelentve';
                    // Sorrendbe rakjuk a jelölteket egyből
                    nationalListCandidates = (orgListInfo.jeloltek || []).map(c => ({
                        ...c,
                        statusName: statusMap[c.allapot] || 'Bejelentve'
                    })).sort((a, b) => a.sorsz - b.sorsz);
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
                nationalListCandidates
            };
        }).sort((a, b) => b.candidateCount - a.candidateCount);

    return processCoalitions(organizations);
};

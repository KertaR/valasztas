import {
    calculateStrategicMetrics,
    calculateTrivia,
    calculateStatusBreakdown
} from '../dataHelpers';

export const calculateFormationsProgress = (candidates, orgMap) => {
    const formationsMap = {};
    candidates.forEach(c => {
        if (!c.jelolo_szervezetek || c.jelolo_szervezetek.length === 0) return;

        const sortedSzkods = [...c.jelolo_szervezetek].sort((a, b) => a - b);
        const key = sortedSzkods.join(',');

        if (!formationsMap[key]) {
            const fullNames = sortedSzkods.map(id => orgMap[id]?.nev || 'Ismeretlen').join(' - ');
            const abbrNames = sortedSzkods.map(id => orgMap[id]?.r_nev || orgMap[id]?.nev || 'Ismeretlen').join('-');

            formationsMap[key] = {
                key, szkods: sortedSzkods, abbr: abbrNames, fullName: fullNames,
                registeredOevks: new Set(), pendingOevks: new Set(),
                registeredCounties: new Set(), pendingCounties: new Set()
            };
        }

        const f = formationsMap[key];
        const oevkObj = c.maz + '-' + c.evk;
        const isRegistered = c.statusName.startsWith('Nyilvántartásba véve') || c.statusName === 'Bejelentve' || c.statusName === 'Ismételten bejelentve';

        if (isRegistered) {
            f.registeredOevks.add(oevkObj);
            f.registeredCounties.add(c.maz);
        } else {
            f.pendingOevks.add(oevkObj);
            f.pendingCounties.add(c.maz);
        }
    });

    return Object.values(formationsMap).map(f => {
        const hasCapital = f.registeredCounties.has('01');
        const pendingHasCapital = f.pendingCounties.has('01') || hasCapital;

        const uniquePendingOevks = new Set([...f.pendingOevks].filter(x => !f.registeredOevks.has(x)));
        const uniquePendingCounties = new Set([...f.pendingCounties].filter(x => !f.registeredCounties.has(x)));

        const regOevkCount = f.registeredOevks.size;
        const pendingOevkCount = uniquePendingOevks.size;
        const regCountyCount = f.registeredCounties.size;
        const pendingCountyCount = uniquePendingCounties.size;

        const isSure = regOevkCount >= 71 && regCountyCount >= 15 && hasCapital;
        const isPossible = (regOevkCount + pendingOevkCount) >= 71 && (regCountyCount + pendingCountyCount) >= 15 && pendingHasCapital;

        return {
            ...f, regOevkCount, pendingOevkCount, totalOevkCount: regOevkCount + pendingOevkCount,
            regCountyCount, pendingCountyCount, totalCountyCount: regCountyCount + pendingCountyCount,
            hasCapital, pendingHasCapital, isSure, isPossible
        };
    }).sort((a, b) => b.totalOevkCount - a.totalOevkCount);
};

export const generateStats = ({
    partyCounts,
    organizations,
    statusCounts,
    statusCategories,
    countyCounts,
    countyStatsObj,
    districts,
    candidates,
    allCandidates,
    totalEligibleVoters,
    yesterdayData,
    statusMap,
    isExcludedStatus
}) => {
    const topParties = Object.entries(partyCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const topRegisteredParties = organizations
        .filter(o => !o.isCoalitionPartner)
        .map(org => ({ name: org.coalitionAbbr || org.r_nev || org.nev, count: org.registeredCandidateCount }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const topCounties = Object.entries(countyCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const countiesData = Object.values(countyStatsObj).sort((a, b) => b.candidateCount - a.candidateCount);
    const mostContestedOevk = districts.length > 0 ? districts[0] : null;

    const recentUpdates = [...candidates]
        .filter(c => c.allapot_valt)
        .sort((a, b) => new Date(b.allapot_valt).getTime() - new Date(a.allapot_valt).getTime())
        .slice(0, 8);

    const diffs = { candidates: 0, organizations: 0, districts: 0, voters: 0 };
    if (yesterdayData) {
        const yesterdayActiveCandCount = (yesterdayData.jeloltek || []).filter(c => {
            const statusName = statusMap[c.allapot] || '';
            return !isExcludedStatus(statusName);
        }).length;
        diffs.candidates = candidates.length - yesterdayActiveCandCount;
        diffs.organizations = organizations.length - (yesterdayData.szervezetek?.length || 0);
        diffs.districts = districts.length - (yesterdayData.oevk?.length || 0);

        let yesterdayTotalVoters = 0;
        if (yesterdayData.oevk) yesterdayData.oevk.forEach(d => { yesterdayTotalVoters += (d.letszam?.indulo || 0); });
        diffs.voters = totalEligibleVoters - yesterdayTotalVoters;
    }

    return {
        topParties,
        topRegisteredParties,
        statusCounts,
        statusCategories,
        statusBreakdown: calculateStatusBreakdown(statusCounts),
        topCounties,
        totalEligibleVoters,
        mostContestedOevk,
        recentUpdates,
        diffs,
        trivia: calculateTrivia(candidates),
        strategic: calculateStrategicMetrics(districts, organizations, candidates, countiesData)
    };
};

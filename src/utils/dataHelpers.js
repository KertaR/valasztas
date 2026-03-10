export const processCoalitions = (organizations) => {
    const processedCoalitions = new Set();
    return organizations.map(org => {
        if (processedCoalitions.has(org.szkod)) return { ...org, isCoalitionPartner: true };

        const closeAlliances = org.alliances.filter(a => a.count > org.candidateCount * 0.8);

        if (closeAlliances.length > 0) {
            const partnerIds = closeAlliances.map(a => a.szkod);
            partnerIds.forEach(id => processedCoalitions.add(id));

            const coalitionAbbr = [org.r_nev || org.nev, ...closeAlliances.map(a => a.abbr)].join('-');
            const coalitionFullName = [org.nev, ...closeAlliances.map(a => a.name)].join(' - ');

            return {
                ...org,
                isCoalitionMain: true,
                coalitionAbbr,
                coalitionFullName,
                coalitionPartnerIds: partnerIds
            };
        }

        return { ...org, isCoalitionMain: false };
    });
};

export const calculateStrategicMetrics = (districts, organizations, candidates, countiesData) => {
    // Előkészítjük a jelenléti térképet a $O(1)$ lookup-hoz (O(N) idő)
    const countyPresence = {};
    countiesData.forEach(c => countyPresence[c.nev] = new Set());

    candidates.forEach(cand => {
        if (cand.countyName && cand.jelolo_szervezetek) {
            if (!countyPresence[cand.countyName]) countyPresence[cand.countyName] = new Set();
            cand.jelolo_szervezetek.forEach(szkod => countyPresence[cand.countyName].add(szkod));
        }
    });

    return {
        battlegrounds: districts.filter(d => d.candidateCount >= 8).slice(0, 5),
        atRisk: districts.filter(d => d.candidateCount < 3).slice(0, 5),
        partyGaps: organizations
            .filter(org => !org.isCoalitionPartner && org.registeredOevkCoverage > 0)
            .map(org => {
                const targetIds = [org.szkod, ...(org.coalitionPartnerIds || [])];

                const missingCounties = countiesData
                    .filter(c => {
                        const presenceSet = countyPresence[c.nev];
                        if (!presenceSet) return true;

                        // Check if any of the targetIds is in the county's presence set
                        const hasCandidateInCounty = targetIds.some(id => presenceSet.has(id));
                        return !hasCandidateInCounty;
                    })
                    .map(c => c.nev);

                return {
                    name: org.coalitionAbbr || org.r_nev,
                    gapCount: missingCounties.length,
                    missingCounties
                };
            })
            .filter(g => g.gapCount > 0)
            .sort((a, b) => a.gapCount - b.gapCount)
    };
};

export const calculateTrivia = (candidates) => {
    let withPhotoCount = 0;
    let independentCount = 0;
    const topNameMap = {};

    candidates.forEach(c => {
        if (c.fenykep) withPhotoCount++;
        if (c.partyNames === 'Független' || (!c.jelolo_szervezetek?.length && !c.jlcs_nev)) {
            independentCount++;
        }

        // Keresztnév kiválasztása (az előtagok kiszűrése után az első elem a vezetéknév, a második a keresztnév)
        const nameParts = (c.neve || '')
            .split(' ')
            .filter(n => n && !n.includes('Dr.') && !n.includes('dr.') && !n.includes('ifj.') && !n.includes('id.') && !n.includes('özv.'));
        if (nameParts.length > 1) {
            const firstName = nameParts[1];
            topNameMap[firstName] = (topNameMap[firstName] || 0) + 1;
        }
    });

    let topName = { name: '-', count: 0 };
    for (const [name, count] of Object.entries(topNameMap)) {
        if (count > topName.count) {
            topName = { name, count };
        }
    }

    return {
        drCount: candidates.filter(c => c.neve?.includes('Dr.') || c.neve?.includes('dr.')).length,
        femaleCount: candidates.filter(c => {
            const n = c.neve || '';
            return n.includes('né ') || n.includes('né-') || n.endsWith('né');
        }).length,
        avgCandidatesPerOevk: Math.round((candidates.length / 106) * 10) / 10,
        independentCount,
        withPhotoCount,
        topName: topName.name !== '-' ? `${topName.name} (${topName.count}x)` : '-'
    };
};

export const calculateStatusBreakdown = (statusCounts) => {
    return Object.entries(statusCounts).map(([name, count]) => {
        const lowerName = name.toLowerCase();
        let type = 'pending';

        if (lowerName.includes('visszautasítva') && lowerName.includes('nem jogerős')) {
            type = 'visszautasitva_pre';
        } else if (lowerName.includes('visszautasítva')) {
            type = 'visszautasitva_final';
        } else if (name === 'Nyilvántartásba véve') {
            type = 'registered';
        } else if (lowerName.includes('nem jogerős')) {
            type = 'registered_pre';
        } else if (lowerName === 'nem kíván indulni') {
            type = 'not_starting';
        } else if (lowerName.includes('törölve') || lowerName.includes('elutasítva') || lowerName.includes('kiesett') || lowerName.includes('visszalépett')) {
            type = 'deleted';
        }

        return { name, count, type };
    }).sort((a, b) => b.count - a.count);
};

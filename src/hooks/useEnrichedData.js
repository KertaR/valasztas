import { useMemo } from 'react';
import { geoArea } from 'd3-geo';
import {
    processCoalitions,
    calculateStrategicMetrics,
    calculateTrivia,
    calculateStatusBreakdown
} from '../utils/dataHelpers';
import { STATUS_MAP } from '../utils/constants';

export function useEnrichedData(data, yesterdayData, isAllUploaded) {
    return useMemo(() => {
        if (!isAllUploaded) return { candidates: [], districts: [], organizations: [], countiesData: [], settlements: [], stats: {} };

        const statusMap = STATUS_MAP;

        const orgMap = {};
        if (data.szervezetek) {
            data.szervezetek.forEach(org => orgMap[org.szkod] = org);
        }

        const distMap = {};
        const countyMap = {};
        const countyStatsObj = {};
        let totalEligibleVoters = 0;

        if (data.megyek) {
            data.megyek.forEach(megye => {
                countyMap[megye.leiro.maz] = megye.leiro.nev;
            });
        }

        if (data.oevk) {
            data.oevk.forEach(dist => {
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

        const yesterdayJeloltStatusMap = {};
        if (yesterdayData && yesterdayData.jeloltek) {
            yesterdayData.jeloltek.forEach(c => {
                yesterdayJeloltStatusMap[String(c.ej_id || c.szj)] = statusMap[c.allapot] || `Ismeretlen kód: ${c.allapot}`;
            });
        }

        const partyCounts = {};
        const statusCounts = {};
        const countyCounts = {};
        const oevkCandidateCounts = {};
        const statusCategories = {
            registered: 0,       // Sötétzöld (Final)
            registered_pre: 0,   // Világoszöld (Non-final)
            pending: 0,          // Kék (Other pending)
            not_starting: 0,     // Szürke (Nem kíván indulni)
            deleted: 0,          // Piros (Törölve/Elutasítva)
            visszautasitva_pre: 0, // Világospiros
            visszautasitva_final: 0 // Sötétpiros
        };

        const processedCandIds = new Set();

        // 0. Update status counts for ALL entries before filtering
        (data.jeloltek || []).forEach(candidate => {
            const statusName = statusMap[candidate.allapot] || `Ismeretlen kód: ${candidate.allapot}`;
            statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;

            const lowerStatus = statusName.toLowerCase();
            if (
                statusName === 'Nyilvántartásba véve'
            ) {
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

        // 1. Candidates processing (Active list for tables/grids)
        const allCandidates = (data.jeloltek || []).map(candidate => {
            const candId = String(candidate.ej_id || candidate.szj || `${candidate.maz}-${candidate.evk}-${candidate.neve}`);

            // Duplikáció szűrés
            if (processedCandIds.has(candId)) return null;
            processedCandIds.add(candId);

            const statusName = statusMap[candidate.allapot] || `Ismeretlen kód: ${candidate.allapot}`;
            const lowerStatus = statusName.toLowerCase();

            // Jelölés, ha a jelentkező kiesett / törölték
            const isExcluded = lowerStatus.includes('törölve') ||
                lowerStatus.includes('elutasítva') ||
                lowerStatus.includes('visszautasítva') ||
                lowerStatus.includes('kiesett') ||
                lowerStatus.includes('visszalépett') ||
                lowerStatus.includes('visszavon') ||
                lowerStatus.includes('nem kíván') ||
                lowerStatus.includes('megszűnt');

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
        }).filter(Boolean);

        const candidates = allCandidates.filter(c => !c.isExcluded);

        // 2. Organizations processing
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

        organizations = processCoalitions(organizations);

        // 3. Districts processing
        const yesterdayDistMap = {};
        if (yesterdayData && yesterdayData.oevk) {
            yesterdayData.oevk.forEach(dist => {
                yesterdayDistMap[`${dist.maz}-${dist.evk}`] = dist;
            });
        }

        const districts = (data.oevk || []).map(dist => {
            const key = `${dist.maz}-${dist.evk}`;
            const yDist = yesterdayDistMap[key];

            const kulkep = dist.letszam?.kuvi || dist.letszam?.kulkep || 0;
            const atjel = dist.letszam?.atjel || dist.letszam?.atjelentkezo || 0;
            const atjelInnen = dist.letszam?.atjelInnen || 0;
            const belfoldi = dist.letszam?.indulo || 0;

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

        // 4. Formations Progress (Listaállítási kalkuláció)
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

        const formationsProgress = Object.values(formationsMap).map(f => {
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

        // 5. Stats aggregation
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

        // Helper: meghatározza, hogy egy státusz "kizárt"-e (nem aktív jelölt)
        const isExcludedStatus = (statusName) => {
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

        const diffs = { candidates: 0, organizations: 0, districts: 0, voters: 0 };
        if (yesterdayData) {
            // Tegnapi aktív (nem kizárt) jelöltek száma a pontos összehasonlításhoz
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

        // 6. Removed candidates:
        //    a) Teljesen eltűnt az adatbázisból (ID sincs ma)
        //    b) Tegnap aktív volt, ma kizárt státuszú (ez csökkenti az "Induló Jelöltek" számát)
        const todayCandIdSet = new Set(allCandidates.map(c => String(c.ej_id || c.szj)));

        // a) Teljesen eltűnt jelöltek
        const goneCandidates = yesterdayData ? (yesterdayData.jeloltek || []).filter(c => {
            const id = String(c.ej_id || c.szj);
            return !todayCandIdSet.has(id);
        }).map(c => ({
            ...c,
            statusName: yesterdayJeloltStatusMap[String(c.ej_id || c.szj)] || 'Ismeretlen',
            removalReason: 'Eltűnt az adatbázisból',
            isRemoved: true
        })) : [];

        // b) Tegnap aktív, ma kizárt (státuszuk megváltozott kizáróra a snapshot összehasonlítás szerint)
        const newlyExcludedCandidates = allCandidates.filter(c => {
            if (!c.isExcluded) return false;       // csak a ma kizártak
            if (!c.hasStatusChanged) return false;  // csak ha változott a státusz
            const oldStatus = c.oldStatusName;
            if (!oldStatus) return false;           // csak ha volt tegnapi adat
            return !isExcludedStatus(oldStatus);   // és tegnap aktív volt
        }).map(c => ({
            ...c,
            removalReason: `Státusz: ${c.oldStatusName} → ${c.statusName}`,
            isRemoved: true
        }));

        const removedCandidates = [...goneCandidates, ...newlyExcludedCandidates];

        return {
            allCandidates, candidates, districts, organizations, countiesData, formationsProgress, removedCandidates,
            settlements: data.telepulesek || [],
            oevkPoligonok: {
                type: 'FeatureCollection',
                features: (data.oevkPoligonok || []).map(p => {
                    if (!p.poligon) return null;

                    // NVI formátum: "lat lon,lat lon,..."
                    // GeoJSON elvárás: [[lon, lat], [lon, lat], ...]
                    const coords = p.poligon.split(',').map(pair => {
                        const pts = pair.trim().split(/\s+/);
                        if (pts.length < 2) return null;
                        const lat = parseFloat(pts[0]);
                        const lon = parseFloat(pts[1]);
                        if (isNaN(lat) || isNaN(lon)) return null;
                        return [lon, lat];
                    }).filter(Boolean);

                    if (coords.length < 3) return null;

                    // GeoJSON poligon gyűrűnek zártnak kell lennie (első pont = utolsó pont)
                    if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
                        coords.push(coords[0]);
                    }



                    // Meghatározzuk a feature-t
                    const feature = {
                        type: 'Feature',
                        id: `oevk-${p.maz}-${p.evk}`,
                        properties: {
                            maz: p.maz,
                            evk: p.evk,
                            name: `${p.maz}-${p.evk}`
                        },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [coords]
                        }
                    };

                    // d3-geo gömbfelületi terület alapú javítás:
                    // Ha a terület > 2π (fél gömb), akkor a poligon invertált (kifelé tölt)
                    if (geoArea(feature) > 2 * Math.PI) {
                        feature.geometry.coordinates[0].reverse();
                    }

                    return feature;
                }).filter(Boolean)
            },
            stats: {
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
            }
        };
    }, [data, yesterdayData, isAllUploaded]);
}

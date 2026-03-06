import { useMemo } from 'react';

export function useSeatCalculator(votes, fractionalBonus) {
    const mandates = useMemo(() => {
        // 199 mandates total: 106 OEVK, 93 List
        const parties = [
            { id: 'fidesz', name: 'FIDESZ-KDNP', color: '#f97316', vote: votes.fidesz },
            { id: 'tisza', name: 'TISZA', color: '#06b6d4', vote: votes.tisza },
            { id: 'dk', name: 'DK', color: '#3b82f6', vote: votes.dk },
            { id: 'mhm', name: 'Mi Hazánk', color: '#10b981', vote: votes.mhm },
            { id: 'egyhat', name: 'MKKP / Egyéb átlépő', color: '#8b5cf6', vote: votes.egyhat }
        ];

        // 1. Keresztek és Küszöb (5%)
        const eligibleParties = parties.filter(p => p.vote >= 5);
        let oevkSeats = { fidesz: 0, tisza: 0, dk: 0, mhm: 0, egyhat: 0, egyeb: 0 };
        let listSeats = { fidesz: 0, tisza: 0, dk: 0, mhm: 0, egyhat: 0, egyeb: 0 };

        // 2. OEVK Becslés (Továbbfejlesztett Heurisztika: FPTP hatás szimulációja)
        // Magyarországon 106 kerület van. Számoljunk egy kerületi eloszlást szimuláló súlyozással.
        // A leghatékonyabb a "köbös" vagy egy nagyobb kitevős arányosítás, ami a győztest felülreprezentálja (Győztes mindent visz).
        const oevkExponent = 3.8; // Erős torzítás a győztes felé
        const totalTopVotes = eligibleParties.reduce((sum, p) => sum + Math.pow(p.vote, oevkExponent), 0);

        if (totalTopVotes > 0) {
            let allocatedOevk = 0;
            const sortedForOevk = [...eligibleParties].sort((a, b) => b.vote - a.vote);
            sortedForOevk.forEach((p, idx) => {
                if (idx === sortedForOevk.length - 1) {
                    oevkSeats[p.id] = 106 - allocatedOevk;
                } else {
                    const seats = Math.round((Math.pow(p.vote, oevkExponent) / totalTopVotes) * 106);
                    oevkSeats[p.id] = seats;
                    allocatedOevk += seats;
                }
            });
            // Korrekció, ha véletlen túlléptük vagy alulmaradtunk az 106-on kerekítés miatt
            const exactOevk = Object.values(oevkSeats).reduce((a, b) => a + b, 0);
            if (exactOevk !== 106 && sortedForOevk.length > 0) {
                oevkSeats[sortedForOevk[0].id] += (106 - exactOevk);
            }
        }

        // 3. Országos Listás Mandátumok (93 darab) - D'Hondt-mátrix szimulálása
        // A töredékszavazatok bónusza alapján módosítjuk a D'Hondt mátrix kiinduló szavazatait.
        if (eligibleParties.length > 0) {
            let dHondtDivisors = [];
            // Fiktív 5 millió szavazóval számolunk a nagy számok törvénye miatt a D'Hondt tökéletes osztásáért
            const baseVotes = 5000000;
            const oevkWinnerId = [...eligibleParties].sort((a, b) => (oevkSeats[b.id] || 0) - (oevkSeats[a.id] || 0))[0]?.id;

            eligibleParties.forEach(p => {
                let rawVotes = (p.vote / 100) * baseVotes;
                if (oevkWinnerId === p.id) {
                    rawVotes += rawVotes * (fractionalBonus / 100);
                }
                for (let i = 1; i <= 93; i++) {
                    dHondtDivisors.push({ id: p.id, value: rawVotes / i });
                }
            });
            // Rendezzük csökkenő sorrendbe, és a legjobb 93 osztó kap egy listás mandátumot
            dHondtDivisors.sort((a, b) => b.value - a.value);
            for (let i = 0; i < 93; i++) {
                listSeats[dHondtDivisors[i].id]++;
            }
        }

        return parties.map(p => ({
            ...p,
            oevk: oevkSeats[p.id] || 0,
            list: listSeats[p.id] || 0,
            total: (oevkSeats[p.id] || 0) + (listSeats[p.id] || 0)
        })).filter(p => p.total > 0 || p.vote >= 5);

    }, [votes, fractionalBonus]);

    const parliamentData = useMemo(() => {
        return mandates.map(m => ({
            name: m.name,
            value: m.total,
            color: m.color
        })).filter(m => m.value > 0).sort((a, b) => b.value - a.value);
    }, [mandates]);

    const parliamentSeats = useMemo(() => {
        if (!mandates || mandates.length === 0) return [];
        const rows = [28, 34, 40, 45, 52];
        const radii = [135, 160, 185, 210, 235];
        const seats = [];

        rows.forEach((numSeats, rowIndex) => {
            const r = radii[rowIndex];
            for (let i = 0; i < numSeats; i++) {
                const theta = Math.PI - (i / (numSeats - 1)) * Math.PI;
                seats.push({
                    x: 250 + r * Math.cos(theta),
                    y: 250 - r * Math.sin(theta),
                    angle: theta
                });
            }
        });

        seats.sort((a, b) => b.angle - a.angle); // Balról jobbra

        const ideologyOrder = ['egyhat', 'dk', 'tisza', 'egyeb', 'fidesz', 'mhm'];
        const orderedMandates = [];
        ideologyOrder.forEach(id => {
            const p = mandates.find(m => m.id === id);
            if (p && p.total > 0) orderedMandates.push(p);
        });
        mandates.forEach(p => {
            if (!orderedMandates.some(o => o.id === p.id) && p.total > 0) orderedMandates.push(p);
        });

        let seatIdx = 0;
        orderedMandates.forEach(party => {
            for (let i = 0; i < party.total && seatIdx < seats.length; i++) {
                seats[seatIdx].color = party.color;
                seats[seatIdx].party = party.name;
                seatIdx++;
            }
        });

        return seats;
    }, [mandates]);

    const leadingParty = parliamentData.length > 0 ? parliamentData[0] : null;

    let leadingStatus = null;
    let leadingColor = "text-slate-500";
    if (leadingParty) {
        if (leadingParty.value >= 133) {
            leadingStatus = "Kétharmados (2/3) többség";
            leadingColor = "text-emerald-500 dark:text-emerald-400";
        } else if (leadingParty.value >= 100) {
            leadingStatus = "Abszolút többség";
            leadingColor = "text-blue-500 dark:text-blue-400";
        } else {
            leadingStatus = "Nincs meg a többség (Koalíciókényszer)";
            leadingColor = "text-amber-500 dark:text-amber-400";
        }
    }

    return {
        mandates,
        parliamentData,
        parliamentSeats,
        leadingParty,
        leadingStatus,
        leadingColor
    };
}

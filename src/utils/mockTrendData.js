export const generateTrendData = (enrichedData) => {
    if (!enrichedData || !enrichedData.candidates) return [];

    const history = [];
    const baseDate = new Date(); // Ma

    // Top Pártok kiszámítása a jelenlegi végállapot alapján
    const fideszFinal = enrichedData.organizations.find(o => o.nev.includes('FIDESZ'))?.candidateCount || 106;
    const tiszaFinal = enrichedData.organizations.find(o => o.nev.includes('TISZA'))?.candidateCount || 106;
    const dkFinal = enrichedData.organizations.find(o => o.nev.includes('Demokratikus Koalíció'))?.candidateCount || 100;
    const mhmFinal = enrichedData.organizations.find(o => o.nev.includes('Mi Hazánk'))?.candidateCount || 106;

    const totalFinal = enrichedData.candidates.length;
    const registeredFinal = enrichedData.candidates.filter(c => c.statusName.startsWith('Nyilvántartásba véve')).length;

    // Menjünk vissza az időben 7 napot, napi 3 méréssel (9:00, 13:00, 17:00)
    let currentTotal = Math.max(0, totalFinal - 450); // Kezdőpont
    let currentRegistered = Math.max(0, registeredFinal - 600);

    let currentFidesz = Math.max(0, fideszFinal - 50);
    let currentTisza = Math.max(0, tiszaFinal - 80);
    let currentDk = Math.max(0, dkFinal - 40);
    let currentMhm = Math.max(0, mhmFinal - 30);

    const times = ['09:00', '13:00', '17:00'];

    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(currentDate.getDate() - dayOffset);

        for (const time of times) {
            // Ne generáljunk jövőbeli pontokat a mai napra, ha már elmúlt a 17:00 akkor mehet. 
            // Egyszerűség kedvéért minden pontot berakunk, és az utolsó a legfrissebb.

            // Random lépésekkel haladunk a végső célpont (Final) felé
            const remSteps = (dayOffset * 3) + (3 - times.indexOf(time));
            if (remSteps === 0) break;

            // Csak akkor növeljük, ha növekedni kell
            if (currentTotal < totalFinal) currentTotal += Math.floor(Math.random() * ((totalFinal - currentTotal) / remSteps * 2));
            if (currentRegistered < registeredFinal) currentRegistered += Math.floor(Math.random() * ((registeredFinal - currentRegistered) / remSteps * 2.5));
            if (currentFidesz < fideszFinal) currentFidesz += Math.floor(Math.random() * ((fideszFinal - currentFidesz) / remSteps * 2));
            if (currentTisza < tiszaFinal) currentTisza += Math.floor(Math.random() * ((tiszaFinal - currentTisza) / remSteps * 2));
            if (currentDk < dkFinal) currentDk += Math.floor(Math.random() * ((dkFinal - currentDk) / remSteps * 2));
            if (currentMhm < mhmFinal) currentMhm += Math.floor(Math.random() * ((mhmFinal - currentMhm) / remSteps * 2));

            // Ha utolsó elem (dayOffset === 0 && time === utolsó vizsgált), akkor beállítjuk a pontos Final adatokat
            const isLast = (dayOffset === 0 && time === '17:00');

            history.push({
                dateStr: `${currentDate.getMonth() + 1}. ${currentDate.getDate().toString().padStart(2, '0')}.`,
                timeStr: time,
                name: `${currentDate.getMonth() + 1}. ${currentDate.getDate().toString().padStart(2, '0')}. ${time}`,
                total: isLast ? totalFinal : currentTotal,
                registered: isLast ? registeredFinal : currentRegistered,
                fidesz: isLast ? fideszFinal : currentFidesz,
                tisza: isLast ? tiszaFinal : currentTisza,
                dk: isLast ? dkFinal : currentDk,
                mhm: isLast ? mhmFinal : currentMhm,
            });
        }
    }

    // Biztonsági fix, ha current day 17:00 kimaradt volna logikailag a valós idő miatt, az isLast felülírja az utolsót
    if (history.length > 0) {
        history[history.length - 1].total = totalFinal;
        history[history.length - 1].registered = registeredFinal;
        history[history.length - 1].fidesz = fideszFinal;
        history[history.length - 1].tisza = tiszaFinal;
        history[history.length - 1].dk = dkFinal;
        history[history.length - 1].mhm = mhmFinal;
    }

    return history;
};

const getCurrentNviDateStr = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}${day}0900`; // Feltételezzük a reggel 9 órás (0900) frissítést
};

export const NVI_DATE = getCurrentNviDateStr(0);
export const NVI_DATE_YESTERDAY = getCurrentNviDateStr(1);

export const CONFIG_URL = '/api/nvi/config.json';

// Fetch through the local Vercel rewrite route to avoid CORS constraints.
export const getNviUrls = (verStr) => ({
    megyek: `/api/nvi/${verStr}/ver/Megyek.json`,
    telepulesek: `/api/nvi/${verStr}/ver/Telepulesek.json`,
    oevk: `/api/nvi/${verStr}/ver/OevkAdatok.json`,
    jeloltek: `/api/nvi/${verStr}/ver/EgyeniJeloltek.json`,
    szervezetek: `/api/nvi/${verStr}/ver/Szervezetek.json`,
    oevkPoligonok: `/api/nvi/${verStr}/ver/OevkPoligonok.json`,
    listakEsJeloltek: `/api/nvi/${verStr}/ver/ListakEsJeloltek.json`
});

export const STATUS_MAP = {
    "0": "Bejelentve",
    "1": "Nyilvántartásba véve",
    "2": "Nyilvántartásba vétel visszautasítva (nem jogerős)",
    "3": "Nyilvántartásból törölve",
    "4": "Nyilvántartásba vétel visszautasítva",
    "5": "Nyilvántartásba véve (nem jogerős)",
    "6": "Nyilvántartásból törölve (nem jogerős)",
    "7": "Jelölt kiesett (Lemondott)",
    "8": "Jelölt kiesett (Elhunyt)",
    "9": "Jelölt kiesett (Választhatóságát elveszítette)",
    "11": "Jelölő szervezete törölve",
    "12": "Ajánlóíveket átvette",
    "13": "Ajánlóíveket nem adta le határidőben",
    "14": "Ajánlóíveket leadta határidőben",
    "15": "Nem kíván indulni",
    "16": "Ajánlóívet igényelt",
    "17": "Ajánlóív igénylése visszautasítva",
    "18": "Lista a nyilvántartásból törölve (nem jogerős)",
    "19": "Lista a nyilvántartásból törölve",
    "20": "Törlés jogorvoslat alatt",
    "21": "Jogorvoslat alatt",
    "22": "Kiesett (Listája vagy szervezete törölve)",
    "23": "Ismételten bejelentve",
    "24": "Nyilvántartásba vétele visszautasítva (nem jogerős)",
    "25": "Nyilvántartásba vétele visszautasítva",
    "26": "Nem állít listát",
    "27": "Kiesett (Visszavonva)",
    "28": "Jelölt kiesett (Törölték a névjegyzékből)",
    "29": "Technikai törölt",
    "33": "Kiesett",
    "34": "Kérelmét visszavonta",
    "333": "Törölt"
};

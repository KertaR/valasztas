# Országgyűlési Választások 2026 - Adataudit és Elemző App

Egy interaktív, React-alapú webalkalmazás, amely a hivatalos Nemzeti Választási Iroda (NVI) adataira építve, valós időben vizualizálja és elemzi a 2026-os magyarországi országgyűlési választások jelöltjeihez, szervezeteihez és egyéni választókerületeihez (OEVK) kapcsolódó adatokat.

## Funkciók

Az alkalmazás több különböző nézeten keresztül teszi átláthatóvá a választási folyamatot:

- **Műszerfal (Dashboard)**: Átfogó statisztikák, napi változások kiemelése és gyors diagramok a jelöltek regisztrációs fázisairól és pártok teljesítményéről.
- **Jelöltek**: Kereshető adatbázis kártyás vagy táblázatos nézetben. Kijelzi a jelölt státuszát, induló OEVK-ját, jelölő szervezetét (vagy pártszövetségét) és hivatalos fényképi azonosítóját is.
- **Választókerületek (OEVK)**: Integrált Magyarország-térkép és választókerületi lista, amely földrajzilag is mutatja az egyéni kerületeket. Minden kerületnél az induló jelöltek névsora külön kártyán megtekinthető.
- **Szervezetek (Pártok)**: A regisztrált formációk listája a bejelentett jelöltek számával (különböző fázisokra bontva) és szövetségi viszonylatok feltüntetésével.
- **Országos Listák**: Kettős nézet (Prognózis vs. Hivatalos). Nyomon követi a formációk előrehaladását az országos listaállításhoz (min. 71 OEVK, mind a 14 vármegye + Bp), illetve a hivatalosan listára vett személyek névsorát megjeleníti képpel és sorszámmal.

## Telepítés és Futtatás

A projekt a Vite és a React segítségével épült fel, TailwindCSS formázással kiegészítve.

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása (HMR)
npm run dev

# Éles build elkészítése
npm run build
```

## Működési Mechanizmus & Adatstruktúra

Az applikáció képes letölteni az adatokat **érintőlegesen és direktben az NVI hivatalos szerveréről**, amennyiben ezt a CORS beállítások nem akadályozzák (publikus adathalmazok: `Szervezetek.json`, `EgyeniJeloltek.json`, `Megyek.json`, `Telepulesek.json`, `OevkAdatok.json`, `OevkPoligonok.json`, `ListakEsJeloltek.json`). 

Ezen felül alternatívaként a felület biztosít egy manuális fájlfeltöltő modult: amennyiben az NVI VTR json adatai exportálásra kerültek a gépedre, ezen menüből is maradéktalanul beolvastatható a felületbe.

### Főbb technológiák:
- **React (Vite)**
- **Tailwind CSS**: A formázás és dizájnrendszer alapja (glassmorphism effektekkel, minimalista stílussal).
- **Framer Motion**: Letisztult animációkhoz.
- **Lucide React**: Moduláris, elegáns ikonokhoz.
- **D3-Geo**: A választókerületek térképes (GeoJSON szerkezetű SVG) megjelenítéséért felel.

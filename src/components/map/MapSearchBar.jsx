import { Search, Loader2 } from 'lucide-react';
import { geoContains } from 'd3-geo';

export default function MapSearchBar({
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
    searchError,
    setSearchError,
    oevkPoligonok,
    setSelectedDistrict,
    setMapCenter
}) {
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim() || !oevkPoligonok?.features) return;

        setIsSearching(true);
        setSearchError(null);

        try {
            // Cím geokódolása Nominatim segítségével
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=hu`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.length > 0) {
                const lon = parseFloat(data[0].lon);
                const lat = parseFloat(data[0].lat);

                // D3 geoContains-szal megnézzük melyik GeoJSON poligonba esik a pont
                const point = [lon, lat];
                const matchingFeature = oevkPoligonok.features.find(feature =>
                    geoContains(feature, point)
                );

                if (matchingFeature) {
                    const geoName = `${matchingFeature.properties.maz}-${matchingFeature.properties.evk}`;
                    setSelectedDistrict(geoName);
                    setMapCenter([lat, lon]); // Térkép fókuszálása
                } else {
                    setSearchError("A cím nem esik egyetlen magyarországi választókerületbe sem.");
                }
            } else {
                setSearchError("Nem található a cím. Kérjük, pontosítsa a keresést (Pl.: Budapest, Kossuth Lajos tér 1-3)!");
            }
        } catch (err) {
            console.error("Geocoding hiba:", err);
            setSearchError("Hiba a címkeresés során. Próbálja újra.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative flex flex-col items-start w-full md:w-80 gap-1.5">
            <div className="relative flex items-center w-full">
                <input
                    type="text"
                    placeholder="Lakcím keresése (utca, hsz, város)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Search className="w-4 h-4" />}
                </div>
                <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Keresés
                </button>
            </div>
            {searchError && (
                <span className="text-xs font-semibold text-red-500 dark:text-red-400 px-1.5 leading-tight">{searchError}</span>
            )}
        </form>
    );
}

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import MapController from './MapController';

const HUNGARY_BOUNDS = [
    [45.7, 16.1], // Dél-Nyugat sarok
    [48.6, 22.9]  // Észak-Kelet sarok
];

export default function MapDisplay({
    oevkPoligonok,
    selectedParty,
    selectedDistrict,
    mapCenter,
    getColor,
    handlePathMouseEnter,
    handlePathMouseLeave,
    handlePathMouseMove,
    setSelectedDistrict,
    tooltip
}) {
    const geoJsonElement = useMemo(() => {
        if (!oevkPoligonok?.features || oevkPoligonok.features.length === 0) return null;

        return (
            <GeoJSON
                key={`${selectedParty}-${selectedDistrict}`}
                data={oevkPoligonok}
                style={(feature) => {
                    const geoName = `${feature.properties.maz}-${feature.properties.evk}`;
                    const isSelected = selectedDistrict === geoName;
                    return {
                        fillColor: getColor(geoName),
                        weight: isSelected ? 3.5 : 1,
                        opacity: isSelected ? 1 : 0.6,
                        color: isSelected ? '#eab308' : '#334155', // Erős sárga kijelölés, különben vékony sötétkék
                        fillOpacity: isSelected ? 0.1 : 0.4
                    };
                }}
                onEachFeature={(feature, layer) => {
                    const geoName = `${feature.properties.maz}-${feature.properties.evk}`;

                    layer.on({
                        mouseover: (e) => {
                            const lay = e.target;
                            // Sima kiemelés: kicsit vastagabb szél, erősen áttetsző kitöltés
                            lay.setStyle({ 
                                fillOpacity: 0.1, 
                                weight: selectedDistrict === geoName ? 3.5 : 2.5, 
                                color: selectedDistrict === geoName ? '#eab308' : '#334155' 
                            });
                            handlePathMouseEnter(e.originalEvent, geoName);
                        },
                        mouseout: (e) => {
                            const lay = e.target;
                            // Visszaállítás az alap/kiválasztott állapotba
                            lay.setStyle({ 
                                fillOpacity: selectedDistrict === geoName ? 0.1 : 0.4,
                                weight: selectedDistrict === geoName ? 3.5 : 1,
                                color: selectedDistrict === geoName ? '#eab308' : '#334155'
                            });
                            handlePathMouseLeave();
                        },
                        mousemove: (e) => {
                            handlePathMouseMove(e.originalEvent);
                        },
                        click: () => {
                            setSelectedDistrict(geoName);
                        }
                    });
                }}
            />
        );
    }, [oevkPoligonok, selectedParty, selectedDistrict, getColor, handlePathMouseEnter, handlePathMouseLeave, handlePathMouseMove, setSelectedDistrict]);

    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl bg-sky-50/40 dark:bg-slate-950/40 z-0 map-wrapper">
            <style>{`
                /* Light mode: Szín-kivonás a profi kinézetért */
                .map-tiles-custom .leaflet-tile-pane {
                    filter: saturate(30%) contrast(100%) brightness(105%);
                }
                /* Dark mode: Magyar szövegek is látszódnak, az utcák olvashatóak */
                .dark .map-tiles-custom .leaflet-tile-pane {
                    filter: invert(90%) hue-rotate(180deg) brightness(85%) contrast(120%) saturate(60%);
                }
            `}</style>
            <MapContainer
                center={[47.16, 19.5]}
                zoom={7}
                minZoom={7}
                maxBounds={HUNGARY_BOUNDS}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                className="w-full h-full [&_.leaflet-container]:bg-transparent map-tiles-custom"
            >
                <MapController centerPos={mapCenter} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />

                {geoJsonElement}
            </MapContainer>

        </div>
    );
}

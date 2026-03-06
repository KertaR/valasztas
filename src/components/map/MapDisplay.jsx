import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
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
    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl bg-sky-50/40 dark:bg-slate-950/40 z-0 map-wrapper">
            <MapContainer
                center={[47.16, 19.5]}
                zoom={7}
                minZoom={7}
                maxBounds={HUNGARY_BOUNDS}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <MapController centerPos={mapCenter} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {oevkPoligonok?.features && oevkPoligonok.features.length > 0 && (
                    <GeoJSON
                        key={`${selectedParty}-${selectedDistrict}`}
                        data={oevkPoligonok}
                        style={(feature) => {
                            const geoName = `${feature.properties.maz}-${feature.properties.evk}`;
                            const isSelected = selectedDistrict === geoName;
                            return {
                                fillColor: getColor(geoName),
                                weight: isSelected ? 3 : 1.5,
                                opacity: isSelected ? 1 : 0.8,
                                color: isSelected ? '#eab308' : '#334155', // yellow-500 if selected
                                fillOpacity: isSelected ? 0.7 : 0.5
                            };
                        }}
                        onEachFeature={(feature, layer) => {
                            const geoName = `${feature.properties.maz}-${feature.properties.evk}`;

                            layer.on({
                                mouseover: (e) => {
                                    const lay = e.target;
                                    lay.setStyle({ fillOpacity: 0.8 });
                                    handlePathMouseEnter(e.originalEvent, geoName);
                                },
                                mouseout: (e) => {
                                    const lay = e.target;
                                    lay.setStyle({ fillOpacity: selectedDistrict === geoName ? 0.7 : 0.5 });
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
                )}
            </MapContainer>

            {/* Tooltip */}
            {tooltip.visible && (
                <div
                    className="pointer-events-none fixed z-[9999] bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl max-w-48"
                    style={{
                        left: tooltip.x + 15,
                        top: Math.max(tooltip.y - 15, 8),
                    }}
                    dangerouslySetInnerHTML={{ __html: tooltip.html }}
                />
            )}
        </div>
    );
}

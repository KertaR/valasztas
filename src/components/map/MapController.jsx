import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapController({ centerPos }) {
    const map = useMap();
    useEffect(() => {
        if (centerPos) {
            map.flyTo(centerPos, 11, { animate: true, duration: 1.5 });
        }
    }, [centerPos, map]);
    return null;
}

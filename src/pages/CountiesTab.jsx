import { useState, useRef } from 'react';
import { Info } from 'lucide-react';
import { PageLayout, ExportButton } from '../components/ui';
import { useExportImage } from '../hooks/useExportImage';

// Counties Components
import { CountyChart, CountyTable } from '../components';
import { useUIContext, useDataContext } from '../contexts';

export default function CountiesTab() {
    const { enrichedData } = useDataContext();
    const { setSelectedCountyDetail, setSelectedOevk } = useUIContext();
    const countiesRef = useRef(null);
    const { exportImage, isExporting } = useExportImage(countiesRef, 'varmegyei_osszesito');

    return (
        <PageLayout
            title="Vármegyei Összesítések"
            subtitle="Adatok és statisztikák megyei szintre aggregálva."
            maxWidthClass="max-w-6xl"
            actions={
                <>
                    <div className="hidden sm:flex bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 items-center gap-3 transition-colors">
                        <Info className="w-6 h-6 flex-shrink-0" />
                        <p className="text-xs font-semibold leading-tight max-w-[200px]">A táblázat mutatja a kerületek (OEVK) számát és az ott indulókat.</p>
                    </div>
                    <ExportButton onClick={exportImage} isExporting={isExporting} />
                </>
            }
            contentRef={countiesRef}
        >
            <CountyChart data={enrichedData.countiesData} onSelect={setSelectedCountyDetail} />
            <CountyTable data={enrichedData.countiesData} enrichedData={enrichedData} onSelectOevk={setSelectedOevk} />
        </PageLayout>
    );
}
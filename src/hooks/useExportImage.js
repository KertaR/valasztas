import { useState } from 'react';
import { toPng } from 'html-to-image';

export function useExportImage(ref, filenamePrefix = "export") {
    const [isExporting, setIsExporting] = useState(false);

    const exportImage = async () => {
        if (!ref.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(ref.current, {
                cacheBust: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Image export failed:', err);
            alert('Hiba történt a kép generálása közben.');
        } finally {
            setIsExporting(false);
        }
    };

    return { exportImage, isExporting };
}

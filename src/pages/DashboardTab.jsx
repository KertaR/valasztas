import { useRef, useState } from 'react';
import {
    CandidateStatusChart, TopPartiesChart, ListProgress, RecentChanges,
    ContestedDistrict, DashboardHeader, StatsGrid
} from '../components';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useUIContext, useDataContext } from '../contexts';

export default function DashboardTab() {
    const { enrichedData, data, lastFetchTime, autoRefresh, setAutoRefresh, fetchDataFromWeb: onRefresh, isLoadingWeb } = useDataContext();
    const { setSelectedOevk, setSelectedCandidate, setActiveTab, setIsCandidatesDiffOpen, setDashboardStatusFilter } = useUIContext();

    const onStatusClick = (statusName) => {
        setDashboardStatusFilter(statusName);
        setActiveTab('jeloltek');
    };
    
    const onCandidatesDiffClick = () => setIsCandidatesDiffOpen(true);
    const dashboardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(dashboardRef.current, {
                cacheBust: true,
                backgroundColor: '#f8fafc',
                pixelRatio: 2
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            const pdfHeight = (img.height * pdfWidth) / img.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`valasztas-dashboard-export-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error("PDF Export error:", error);
            alert("Hiba történt a PDF generálása közben.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto">
            
            <DashboardHeader 
                lastFetchTime={lastFetchTime}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
                onRefresh={onRefresh}
                isLoadingWeb={isLoadingWeb}
                handleExportPDF={handleExportPDF}
                isExporting={isExporting}
            />

            <div ref={dashboardRef} className="space-y-6 bg-slate-100 dark:bg-slate-950 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 transition-colors">
                
                <StatsGrid 
                    candidatesCount={enrichedData.candidates.length}
                    organizationsCount={data.szervezetek.length}
                    districtsCount={enrichedData.districts.length}
                    totalEligibleVoters={enrichedData.stats.totalEligibleVoters}
                    diffs={enrichedData.stats.diffs}
                    onCandidatesDiffClick={onCandidatesDiffClick}
                />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Bal Oszlop: Top Pártok és Vizuális Státusz */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Vizuális Státusz és Kördiagram */}
                        <CandidateStatusChart
                            candidatesCount={enrichedData.candidates.length}
                            statusCategories={enrichedData.stats.statusCategories}
                            statusBreakdown={enrichedData.stats.statusBreakdown}
                            onStatusClick={onStatusClick}
                        />

                        {/* Top Pártok Chart */}
                        <TopPartiesChart organizations={enrichedData.organizations} />
                    </div>

                    {/* Jobb Oszlop: Hírfolyam és Kiemelés */}
                    <div className="flex flex-col gap-6">

                        {/* Legkiélezettebb Körzet Kiemelés */}
                        <ContestedDistrict district={enrichedData.stats.mostContestedOevk} onClick={setSelectedOevk} />

                        <ListProgress formations={enrichedData.formationsProgress || []} />
                        <RecentChanges recentUpdates={enrichedData.stats.recentUpdates} setSelectedCandidate={setSelectedCandidate} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

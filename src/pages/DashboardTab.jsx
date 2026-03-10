import { useRef, useState } from 'react';
import { Users, Building2, Map, UsersRound, Loader2, Printer, RefreshCw, Clock } from 'lucide-react';
import {
    StatCard, CandidateStatusChart,
    TopPartiesChart, ListProgress, RecentChanges,
    ContestedDistrict, ElectionCountdown
} from '../components';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useUIContext, useDataContext } from '../contexts';

export default function DashboardTab() {
    const { enrichedData, data, lastFetchTime, autoRefresh, setAutoRefresh, fetchDataFromWeb: onRefresh, isLoadingWeb } = useDataContext();
    const { setSelectedOevk, setSelectedCandidate, setActiveTab, setIsCandidatesDiffOpen } = useUIContext();
    const onStatusClick = () => setActiveTab('valtozasok');
    const onCandidatesDiffClick = () => setIsCandidatesDiffOpen(true);
    const dashboardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return;
        setIsExporting(true);
        try {
            // Using html-to-image to avoid OKLCH parsing errors inherent in html2canvas
            const dataUrl = await toPng(dashboardRef.current, {
                cacheBust: true,
                backgroundColor: '#f8fafc',
                pixelRatio: 2 // Scale up quality
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // Get original dimensions from the created PNG dataUrl
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Áttekintés</h1>
                    <ElectionCountdown />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Utólsó frissítés ideje */}
                    {lastFetchTime && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Frissítés: {lastFetchTime.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                    {/* Auto-refresh kapcsoló (ÉLŐ KÖZVETÍTÉS HATÁS) */}
                    {setAutoRefresh && (
                        <button
                            onClick={() => setAutoRefresh(prev => !prev)}
                            title={autoRefresh ? 'Auto-frissítés kikapcsolása' : 'Nincs auto-frissítés'}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${autoRefresh
                                ? 'bg-slate-900 text-white dark:bg-black border-red-500/50 hover:bg-slate-800'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {autoRefresh ? (
                                <>
                                    <div className="relative flex items-center justify-center w-3 h-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                    </div>
                                    <span className="tracking-widest uppercase shadow-black drop-shadow-md">LIVE</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Auto-off</span>
                                </>
                            )}
                        </button>
                    )}
                    {/* Kézi azonnali frissítés */}
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isLoadingWeb}
                            title="Azonnali frissítés"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50"
                        >
                            {isLoadingWeb ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </button>
                    )}
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                        {isExporting ? 'Generálás...' : 'Elmentés PDF-ként'}
                    </button>
                </div>
            </div>

            <div ref={dashboardRef} className="space-y-6 bg-slate-100 dark:bg-slate-950 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 transition-colors">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard icon={<Users className="w-7 h-7 text-blue-600" />} title="Induló Jelöltek" value={enrichedData.candidates.length} color="bg-blue-100" diff={enrichedData.stats.diffs?.candidates} onClick={onCandidatesDiffClick} />
                    <StatCard icon={<Building2 className="w-7 h-7 text-purple-600" />} title="Jelölő Szervezetek" value={data.szervezetek.length} color="bg-purple-100" diff={enrichedData.stats.diffs?.organizations} />
                    <StatCard icon={<Map className="w-7 h-7 text-emerald-600" />} title="Választókerületek" value={enrichedData.districts.length} color="bg-emerald-100" diff={enrichedData.stats.diffs?.districts} />
                    <StatCard icon={<UsersRound className="w-7 h-7 text-amber-600" />} title="Szavazásra Jogosultak" value={enrichedData.stats.totalEligibleVoters} color="bg-amber-100" diff={enrichedData.stats.diffs?.voters} />
                </div>

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

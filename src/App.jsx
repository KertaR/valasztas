import React, { useState, useEffect } from 'react';
import { Moon, Sun, X, Menu, Globe } from 'lucide-react';

import {
    DashboardTab, CandidatesTab, CompareTab,
    OrganizationsTab, OevkTab, CountiesTab, TransfersTab, SeatCalculatorTab, ChangelogTab, TrendTab, OevkMapTab, ErrorBoundary, NationalListsTab
} from './pages';

import {
    Sidebar, GlobalSearchModal, ToastContainer,
    CandidateModal, OevkModal, OrgModal, CountyModal,
    UploadScreen
} from './components';

import { useElectionData, useEnrichedData, useCandidateFilters } from './hooks';
import { getInitials } from './utils/helpers';

export default function App() {
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => setToast({ message, type });

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedOevk, setSelectedOevk] = useState(null);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [selectedCountyDetail, setSelectedCountyDetail] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleClearApp = () => {
        setActiveTab('dashboard');
        setSelectedCandidate(null);
        setSelectedOevk(null);
        setSelectedOrg(null);
        setSelectedCountyDetail(null);
    };

    const {
        data, yesterdayData, isLoadingWeb, fetchError, isAllUploaded,
        fetchDataFromWeb, handleFileUpload, clearData
    } = useElectionData(showToast, handleClearApp);

    const enrichedData = useEnrichedData(data, yesterdayData, isAllUploaded);

    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('valasztas_dark_mode');
        return saved === 'true' || false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('valasztas_dark_mode', isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    const {
        searchTerm, setSearchTerm,
        selectedParty, setSelectedParty,
        selectedStatus, setSelectedStatus,
        selectedCounty, setSelectedCounty,
        quickFilter, setQuickFilter,
        sortConfig, handleSort,
        currentPage, setCurrentPage, itemsPerPage, totalPages,
        filterOptions,
        processedCandidates,
        paginatedCandidates,
        exportToCSV,
        resetFilters
    } = useCandidateFilters(enrichedData.allCandidates || enrichedData.candidates, showToast);

    const handleClearState = () => {
        clearData();
        resetFilters();
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const switchTab = (tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); };

    const handleStatusClick = (statusName) => {
        setSelectedStatus(statusName);
        switchTab('jeloltek');
    };

    // --- BETÖLTŐ KÉPERNYŐ ---
    if (!isAllUploaded) {
        return (
            <UploadScreen
                fetchError={fetchError}
                fetchDataFromWeb={fetchDataFromWeb}
                isLoadingWeb={isLoadingWeb}
                handleFileUpload={handleFileUpload}
                data={data}
                toast={toast}
            />
        );
    }

    // --- FŐ ALKALMAZÁS FELÜLET ---
    return (
        <div className="h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">

            {/* MOBIL FEJLÉC */}
            <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm transition-colors">
                <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                    <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg">Választás '26</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none">
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none">
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* --- MODÁLIS ABLAKOK --- */}
            <GlobalSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                enrichedData={enrichedData}
                onSelectCandidate={setSelectedCandidate}
                onSelectOrg={setSelectedOrg}
                onSelectOevk={setSelectedOevk}
            />
            <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
            <OevkModal selectedOevk={selectedOevk} enrichedData={enrichedData} onClose={() => setSelectedOevk(null)} />
            <OrgModal selectedOrg={selectedOrg} enrichedData={enrichedData} onClose={() => setSelectedOrg(null)} />
            <CountyModal selectedCounty={selectedCountyDetail} enrichedData={enrichedData} onClose={() => setSelectedCountyDetail(null)} onSelectOevk={setSelectedOevk} />

            {/* --- SIDEBAR COMPONENT --- */}
            <Sidebar
                activeTab={activeTab}
                switchTab={switchTab}
                enrichedData={enrichedData}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                setIsSearchOpen={setIsSearchOpen}
                toggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                handleClearState={handleClearState}
            />

            {/* --- FŐ TARTALOM --- */}
            <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto w-full">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && <DashboardTab enrichedData={enrichedData} data={data} setSelectedOevk={setSelectedOevk} setSelectedCandidate={setSelectedCandidate} onStatusClick={handleStatusClick} />}

                    {activeTab === 'jeloltek' && <CandidatesTab
                        processedCandidates={processedCandidates}
                        enrichedData={enrichedData}
                        exportToCSV={exportToCSV}
                        quickFilter={quickFilter}
                        setQuickFilter={setQuickFilter}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedCounty={selectedCounty}
                        setSelectedCounty={setSelectedCounty}
                        filterOptions={filterOptions}
                        selectedParty={selectedParty}
                        setSelectedParty={setSelectedParty}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        handleSort={handleSort}
                        sortConfig={sortConfig}
                        paginatedCandidates={paginatedCandidates}
                        setSelectedCandidate={setSelectedCandidate}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalPages={totalPages}
                    />}

                    {activeTab === 'osszehasonlitas' && <CompareTab enrichedData={enrichedData} />}

                    {activeTab === 'szervezetek' && <OrganizationsTab enrichedData={enrichedData} setSelectedOrg={setSelectedOrg} />}

                    {activeTab === 'orszagos_listak' && <NationalListsTab enrichedData={enrichedData} />}

                    {activeTab === 'oevk' && <OevkTab enrichedData={enrichedData} setSelectedOevk={setSelectedOevk} />}

                    {activeTab === 'megyek' && <CountiesTab enrichedData={enrichedData} setSelectedCountyDetail={setSelectedCountyDetail} setSelectedOevk={setSelectedOevk} />}

                    {activeTab === 'atjelentkezes' && <TransfersTab enrichedData={enrichedData} setSelectedOevk={setSelectedOevk} />}

                    {activeTab === 'kalkulator' && <SeatCalculatorTab enrichedData={enrichedData} />}

                    {activeTab === 'valtozasok' && <ChangelogTab enrichedData={enrichedData} setSelectedCandidate={setSelectedCandidate} setSelectedOrg={setSelectedOrg} />}

                    {activeTab === 'trendek' && <TrendTab enrichedData={enrichedData} />}

                    {activeTab === 'terkep' && (
                        <ErrorBoundary>
                            <OevkMapTab
                                districts={enrichedData.districts}
                                candidates={enrichedData.allCandidates}
                                organizations={enrichedData.organizations}
                                oevkPoligonok={enrichedData.oevkPoligonok}
                            />
                        </ErrorBoundary>
                    )}

                    {/* Lábjegyzet / Forrásmegjelölés */}
                    <footer className="mt-16 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                        <p>A felületen megjelenített adatok feldolgozása a <strong>Nemzeti Választási Iroda (NVI)</strong> hivatalos adatszolgáltatása (vtr.valasztas.hu) alapján történik.</p>
                        <p className="mt-1">Az alkalmazás független fejlesztés, nem áll kapcsolatban állami szervekkel.</p>
                    </footer>
                </div>
            </main>
            <ToastContainer toast={toast} />
        </div>
    );
}

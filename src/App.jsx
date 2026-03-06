import React from 'react';
import { Moon, Sun, X, Menu, Globe } from 'lucide-react';

import {
    DashboardTab, CandidatesTab, CompareTab,
    OrganizationsTab, OevkTab, CountiesTab, TransfersTab, SeatCalculatorTab, ChangelogTab, TrendTab, OevkMapTab, ErrorBoundary, NationalListsTab, CoalitionBuilderTab
} from './pages';

import {
    Sidebar, GlobalSearchModal, ToastContainer,
    CandidateModal, OevkModal, OrgModal, CountyModal, CandidatesDiffModal,
    UploadScreen
} from './components';

import { UIProvider, DataProvider, FilterProvider, useUIContext, useDataContext } from './contexts';

function AppContent() {
    const {
        toast,
        activeTab,
        isMobileMenuOpen, setIsMobileMenuOpen,
        isDarkMode, toggleDarkMode
    } = useUIContext();

    const {
        data, isLoadingWeb, fetchError, isAllUploaded,
        fetchDataFromWeb, handleFileUpload
    } = useDataContext();

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
            <GlobalSearchModal />
            <CandidateModal />
            <OevkModal />
            <OrgModal />
            <CountyModal />
            <CandidatesDiffModal />

            {/* --- SIDEBAR COMPONENT --- */}
            <Sidebar />

            {/* --- FŐ TARTALOM --- */}
            <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto w-full">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'jeloltek' && <CandidatesTab />}
                    {activeTab === 'osszehasonlitas' && <CompareTab />}
                    {activeTab === 'szervezetek' && <OrganizationsTab />}
                    {activeTab === 'orszagos_listak' && <NationalListsTab />}
                    {activeTab === 'oevk' && <OevkTab />}
                    {activeTab === 'megyek' && <CountiesTab />}
                    {activeTab === 'atjelentkezes' && <TransfersTab />}
                    {activeTab === 'kalkulator' && <SeatCalculatorTab />}
                    {activeTab === 'valtozasok' && <ChangelogTab />}
                    {activeTab === 'trendek' && <TrendTab />}
                    {activeTab === 'osszefoglas' && <CoalitionBuilderTab />}
                    {activeTab === 'terkep' && (
                        <ErrorBoundary>
                            <OevkMapTab />
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

export default function App() {
    return (
        <UIProvider>
            <DataProvider>
                <FilterProvider>
                    <AppContent />
                </FilterProvider>
            </DataProvider>
        </UIProvider>
    );
}

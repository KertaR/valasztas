import {
    Globe, LayoutDashboard, Users, Scale, TrendingUp,
    Building, Map, PieChart, Moon, Sun, Trash2, X, Search, ArrowRightLeft, Calculator, Activity, MapPin, List, Network
} from 'lucide-react';
import NavItem from '../ui/NavItem';

export default function Sidebar({
    activeTab,
    switchTab,
    enrichedData,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsSearchOpen,
    toggleDarkMode,
    isDarkMode,
    handleClearState
}) {
    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-50 md:z-10 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 shadow-2xl md:shadow-none md:h-screen h-full`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 hidden md:block">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Választás '26
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Élő Elemző Dashboard</p>
                </div>

                {/* Mobile Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 md:hidden flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <span className="font-bold text-slate-800 dark:text-white">Menü</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto w-full custom-scrollbar">
                    <button
                        onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-3 mb-4 rounded-xl text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-text group"
                    >
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                            <span className="text-sm font-bold group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Globális Kereső</span>
                        </div>
                        <div className="py-0.5 px-2 bg-white dark:bg-slate-900 rounded shadow-sm text-xs font-bold border border-slate-200 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors hidden md:block">
                            Ctrl K
                        </div>
                    </button>

                    <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Áttekintés" active={activeTab === 'dashboard'} onClick={() => switchTab('dashboard')} />
                    <NavItem icon={<Users className="w-5 h-5" />} label="Egyéni Jelöltek" badge={enrichedData.candidates?.length} active={activeTab === 'jeloltek'} onClick={() => switchTab('jeloltek')} />
                    <NavItem icon={<Activity className="w-5 h-5 text-amber-500 font-bold" />} label="Napi Változások" active={activeTab === 'valtozasok'} onClick={() => switchTab('valtozasok')} />
                    <NavItem icon={<TrendingUp className="w-5 h-5 text-emerald-500 font-bold" />} label="Idősáv és Trendek" active={activeTab === 'trendek'} onClick={() => switchTab('trendek')} />
                    <NavItem icon={<ArrowRightLeft className="w-5 h-5" />} label="Átjelentkezettek" active={activeTab === 'atjelentkezes'} onClick={() => switchTab('atjelentkezes')} />
                    <NavItem icon={<Calculator className="w-5 h-5 text-indigo-500 font-bold" />} label="Mandátumbecslő" active={activeTab === 'kalkulator'} onClick={() => switchTab('kalkulator')} />
                    <NavItem icon={<Scale className="w-5 h-5" />} label="Összehasonlítás" active={activeTab === 'osszehasonlitas'} onClick={() => switchTab('osszehasonlitas')} />
                    <NavItem icon={<Network className="w-5 h-5 text-indigo-500" />} label="Összefogás Tervező" active={activeTab === 'osszefoglas'} onClick={() => switchTab('osszefoglas')} />
                    <NavItem icon={<Building className="w-5 h-5" />} label="Szervezetek" badge={enrichedData.organizations?.length} active={activeTab === 'szervezetek'} onClick={() => switchTab('szervezetek')} />
                    <NavItem icon={<List className="w-5 h-5" />} label="Országos Listák" active={activeTab === 'orszagos_listak'} onClick={() => switchTab('orszagos_listak')} />
                    <NavItem icon={<Map className="w-5 h-5" />} label="Választókerületek" badge={enrichedData.districts?.length} active={activeTab === 'oevk'} onClick={() => switchTab('oevk')} />
                    <NavItem icon={<PieChart className="w-5 h-5" />} label="Vármegyék" badge={enrichedData.countiesData?.length} active={activeTab === 'megyek'} onClick={() => switchTab('megyek')} />
                    <NavItem icon={<MapPin className="w-5 h-5 text-blue-500 font-bold" />} label="Térkép (Béta)" active={activeTab === 'terkep'} onClick={() => switchTab('terkep')} />

                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                    <button onClick={toggleDarkMode} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-indigo-600 dark:text-amber-400 bg-indigo-50 dark:bg-amber-400/10 hover:bg-indigo-100 dark:hover:bg-amber-400/20 border border-transparent rounded-lg transition-colors font-semibold shadow-sm">
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {isDarkMode ? 'Világos Mód' : 'Sötét Mód'}
                    </button>
                    <button onClick={handleClearState} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 border border-transparent rounded-lg transition-colors font-semibold">
                        <Trash2 className="w-4 h-4" /> Elemzés bezárása
                    </button>
                </div>
            </aside>
        </>
    );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUIContext = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => setToast({ message, type });

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedOevk, setSelectedOevk] = useState(null);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [selectedCountyDetail, setSelectedCountyDetail] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCandidatesDiffOpen, setIsCandidatesDiffOpen] = useState(false);

    const handleClearApp = () => {
        setActiveTab('dashboard');
        setSelectedCandidate(null);
        setSelectedOevk(null);
        setSelectedOrg(null);
        setSelectedCountyDetail(null);
    };

    const switchTab = (tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); };

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

    const value = {
        toast, showToast,
        activeTab, setActiveTab, switchTab,
        selectedCandidate, setSelectedCandidate,
        selectedOevk, setSelectedOevk,
        selectedOrg, setSelectedOrg,
        selectedCountyDetail, setSelectedCountyDetail,
        isMobileMenuOpen, setIsMobileMenuOpen,
        isSearchOpen, setIsSearchOpen,
        isCandidatesDiffOpen, setIsCandidatesDiffOpen,
        handleClearApp,
        isDarkMode, toggleDarkMode
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

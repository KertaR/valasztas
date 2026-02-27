import { useState, useMemo, useEffect } from 'react';

export function useCandidateFilters(enrichedDataCandidates, showToast) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParty, setSelectedParty] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');
    const [quickFilter, setQuickFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'allapot_valt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 50;

    const filterOptions = useMemo(() => {
        if (!enrichedDataCandidates || !enrichedDataCandidates.length) return { parties: [], statuses: [], counties: [] };
        return {
            parties: [...new Set(enrichedDataCandidates.map(c => c.partyNames))].sort(),
            statuses: [...new Set(enrichedDataCandidates.map(c => c.statusName))].sort(),
            counties: [...new Set(enrichedDataCandidates.map(c => c.countyName))].sort()
        };
    }, [enrichedDataCandidates]);

    const processedCandidates = useMemo(() => {
        if (!enrichedDataCandidates) return [];
        let result = [...enrichedDataCandidates];

        // Kereső
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(c => c.neve.toLowerCase().includes(lowerSearch) || c.districtName.toLowerCase().includes(lowerSearch) || c.partyNames.toLowerCase().includes(lowerSearch));
        }

        // Alap szűrők
        if (selectedParty) result = result.filter(c => c.partyNames === selectedParty);
        if (selectedStatus) result = result.filter(c => c.statusName === selectedStatus);
        if (selectedCounty) result = result.filter(c => c.countyName === selectedCounty);

        // Gyorsszűrők
        if (quickFilter === 'new') result = result.filter(c => c.isNew);
        if (quickFilter === 'registered') result = result.filter(c => c.statusName.includes('Nyilvántartásba'));
        if (quickFilter === 'independent') result = result.filter(c => c.partyNames === 'Független' || !c.jelolo_szervezetek || c.jelolo_szervezetek.length === 0);

        // Rendezés
        result.sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [enrichedDataCandidates, searchTerm, selectedParty, selectedStatus, selectedCounty, quickFilter, sortConfig]);

    const totalPages = Math.ceil(processedCandidates.length / itemsPerPage) || 1;
    const paginatedCandidates = processedCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const exportToCSV = () => {
        const headers = ['Jelölt neve', 'Vármegye', 'Választókerület', 'Jelölő Szervezet', 'Státusz', 'Frissítve'];
        const csvData = processedCandidates.map(c => [
            `"${c.neve}"`, `"${c.countyName}"`, `"${c.districtName}"`, `"${c.partyNames}"`, `"${c.statusName}"`,
            `"${c.allapot_valt ? new Date(c.allapot_valt).toLocaleDateString('hu-HU') : ''}"`
        ].join(','));

        const csvContent = ['\uFEFF' + headers.join(','), ...csvData].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = `jeloltek_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showToast(`${processedCandidates.length} jelölt adata sikeresen exportálva!`);
    };

    // Visszaállás 1. oldalra szűrésnél
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedParty, selectedStatus, selectedCounty, sortConfig, quickFilter]);

    // reset function
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedParty('');
        setSelectedStatus('');
        setSelectedCounty('');
        setQuickFilter('all');
        setCurrentPage(1);
    }

    return {
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
    };
}

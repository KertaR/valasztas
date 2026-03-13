import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { EnrichedCandidate, EnrichedOrganization, EnrichedDistrict } from '../types/app';

export type SearchResultType = 'candidate' | 'org' | 'oevk';

export interface FlatSearchResult {
    type: SearchResultType;
    item: any;
}

interface UseSearchProps {
    isOpen: boolean;
    enrichedData: {
        candidates: EnrichedCandidate[];
        organizations: EnrichedOrganization[];
        districts: EnrichedDistrict[];
    };
    onSelectCandidate: (c: EnrichedCandidate) => void;
    onSelectOrg: (o: EnrichedOrganization) => void;
    onSelectOevk: (d: EnrichedDistrict) => void;
    onClose: () => void;
}

export function useSearch({
    isOpen,
    enrichedData,
    onSelectCandidate,
    onSelectOrg,
    onSelectOevk,
    onClose
}: UseSearchProps) {
    const [search, setSearch] = useState('');
    const [activeIdx, setActiveIdx] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const activeItemRef = useRef<HTMLDivElement>(null);

    // Reset search when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setSearch('');
            setActiveIdx(-1);
        }
    }, [isOpen]);

    const results = useMemo(() => {
        if (!search || search.length < 2) return { candidates: [], orgs: [], oevks: [] };
        const query = search.toLowerCase();

        const cands = enrichedData.candidates?.filter(c =>
            c.neve.toLowerCase().includes(query) ||
            c.partyNames.toLowerCase().includes(query) ||
            c.districtName.toLowerCase().includes(query)
        ).slice(0, 5) || [];

        const orgs = enrichedData.organizations?.filter(o =>
            !o.isCoalitionPartner && (
                (o.nev && o.nev.toLowerCase().includes(query)) ||
                (o.r_nev && o.r_nev.toLowerCase().includes(query)) ||
                (o.coalitionFullName && o.coalitionFullName.toLowerCase().includes(query)) ||
                (o.coalitionAbbr && o.coalitionAbbr.toLowerCase().includes(query))
            )
        ).slice(0, 5) || [];

        const oevks = enrichedData.districts?.filter(d =>
            d.evk_nev.toLowerCase().includes(query) ||
            (d.maz_nev && d.maz_nev.toLowerCase().includes(query))
        ).slice(0, 5) || [];

        return { candidates: cands, orgs, oevks };
    }, [search, enrichedData]);

    const flatResults = useMemo((): FlatSearchResult[] => [
        ...results.candidates.map(item => ({ type: 'candidate' as const, item })),
        ...results.orgs.map(item => ({ type: 'org' as const, item })),
        ...results.oevks.map(item => ({ type: 'oevk' as const, item }))
    ], [results]);

    const selectResult = useCallback((result: FlatSearchResult) => {
        if (!result) return;
        if (result.type === 'candidate') { onSelectCandidate(result.item); onClose(); }
        else if (result.type === 'org') { onSelectOrg(result.item); onClose(); }
        else if (result.type === 'oevk') { onSelectOevk(result.item); onClose(); }
    }, [onSelectCandidate, onSelectOrg, onSelectOevk, onClose]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') { onClose(); return; }
            if (flatResults.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIdx(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIdx(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
            } else if (e.key === 'Enter' && activeIdx >= 0) {
                e.preventDefault();
                selectResult(flatResults[activeIdx]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, flatResults, activeIdx, selectResult]);

    // Reset activeIdx when search changes
    useEffect(() => { setActiveIdx(-1); }, [search]);

    // Scroll active item into view
    useEffect(() => {
        activeItemRef.current?.scrollIntoView({ block: 'nearest' });
    }, [activeIdx]);

    const hasResults = results.candidates.length > 0 || results.orgs.length > 0 || results.oevks.length > 0;

    return {
        search,
        setSearch,
        results,
        flatResults,
        activeIdx,
        setActiveIdx,
        inputRef,
        activeItemRef,
        hasResults,
        selectResult
    };
}

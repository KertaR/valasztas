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
            (c.partyNames && c.partyNames.toLowerCase().includes(query)) ||
            (c.districtName && c.districtName.toLowerCase().includes(query))
        ) || [];

        const orgs = enrichedData.organizations?.filter(o =>
            !o.isCoalitionPartner && (
                (o.nev && o.nev.toLowerCase().includes(query)) ||
                (o.r_nev && o.r_nev.toLowerCase().includes(query)) ||
                (o.coalitionFullName && o.coalitionFullName.toLowerCase().includes(query)) ||
                (o.coalitionAbbr && o.coalitionAbbr.toLowerCase().includes(query))
            )
        ) || [];

        const oevks = enrichedData.districts?.filter(d =>
            d.evk_nev.toLowerCase().includes(query) ||
            (d.maz_nev && d.maz_nev.toLowerCase().includes(query))
        ) || [];

        return { candidates: cands, orgs, oevks };
    }, [search, enrichedData]);

    const flatResults = useMemo((): FlatSearchResult[] => {
        const flat: FlatSearchResult[] = [];
        if (results.candidates.length > 0) {
            flat.push({ type: 'header' as any, item: 'Jelöltek' });
            results.candidates.forEach(item => flat.push({ type: 'candidate', item }));
        }
        if (results.orgs.length > 0) {
            flat.push({ type: 'header' as any, item: 'Szervezetek' });
            results.orgs.forEach(item => flat.push({ type: 'org', item }));
        }
        if (results.oevks.length > 0) {
            flat.push({ type: 'header' as any, item: 'Választókerületek' });
            results.oevks.forEach(item => flat.push({ type: 'oevk', item }));
        }
        return flat;
    }, [results]);

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
                let next = activeIdx;
                do {
                    next = next < flatResults.length - 1 ? next + 1 : 0;
                } while (flatResults[next].type === 'header' as any && next !== activeIdx);
                setActiveIdx(next);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                let prev = activeIdx;
                do {
                    prev = prev > 0 ? prev - 1 : flatResults.length - 1;
                } while (flatResults[prev].type === 'header' as any && prev !== activeIdx);
                setActiveIdx(prev);
            } else if (e.key === 'Enter' && activeIdx >= 0) {
                e.preventDefault();
                const result = flatResults[activeIdx];
                if (result.type !== 'header' as any) selectResult(result);
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

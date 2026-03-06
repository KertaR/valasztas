import React, { createContext, useContext } from 'react';
import { useCandidateFilters } from '../hooks';
import { useDataContext } from './DataContext';
import { useUIContext } from './UIContext';

const FilterContext = createContext();

export const useFilterContext = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
    const { enrichedData } = useDataContext();
    const { showToast } = useUIContext();
    const candidates = enrichedData?.allCandidates || enrichedData?.candidates || [];

    const filterData = useCandidateFilters(candidates, showToast);

    return (
        <FilterContext.Provider value={filterData}>
            {children}
        </FilterContext.Provider>
    );
};

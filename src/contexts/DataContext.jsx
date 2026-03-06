import React, { createContext, useContext } from 'react';
import { useElectionData, useEnrichedData } from '../hooks';
import { useUIContext } from './UIContext';

const DataContext = createContext();

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useDataContext must be used within a DataProvider");
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const { showToast, handleClearApp } = useUIContext();
    const electionData = useElectionData(showToast, handleClearApp);
    const enrichedData = useEnrichedData(electionData.data, electionData.yesterdayData, electionData.isAllUploaded);

    const handleClearState = () => {
        electionData.clearData();
    };

    const value = {
        ...electionData,
        enrichedData,
        handleClearState
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

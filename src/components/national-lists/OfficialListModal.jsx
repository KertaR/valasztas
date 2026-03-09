import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '../ui';
import CandidateItem from './CandidateItem';

const OfficialListModal = ({ selectedFormation, searchTerm, onClose }) => {
    if (!selectedFormation) return null;

    return (
        <Modal onClose={onClose} maxWidthClass="max-w-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start sticky top-0 z-10">
                <div className="pr-8">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-5 h-5 text-indigo-500" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Hivatalos Országos Lista</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                        {selectedFormation.abbr}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{selectedFormation.fullName}</p>
                </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Jelöltek listája</div>
                    <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                        {selectedFormation.officialCandidates.length} fő
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {selectedFormation.officialCandidates.map((cand) => {
                        const isMatch = searchTerm && cand.neve.toLowerCase().includes(searchTerm.toLowerCase());
                        return <CandidateItem key={cand.tj_id || cand.kpn_id || cand.neve} cand={cand} isMatch={isMatch} variant="full" />;
                    })}
                </div>
            </div>
        </Modal>
    );
};

export default OfficialListModal;

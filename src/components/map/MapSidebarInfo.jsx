import { Users, Crosshair, ShieldAlert, X } from 'lucide-react';

export default function MapSidebarInfo({
    selectedDistrict,
    districtData,
    selectedParty,
    organizations,
    onClose
}) {
    if (!selectedDistrict || !districtData[selectedDistrict]) return null;

    const data = districtData[selectedDistrict];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border-2 border-yellow-400 dark:border-yellow-500/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400 dark:bg-yellow-500"></div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                title="Bezárás"
            >
                <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-slate-800 dark:text-white pr-6">
                {data.districtInfo?.evk_nev || selectedDistrict}
            </h3>

            <div className="flex items-center gap-2 mt-2 mb-4">
                {data.battleground ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800/50">
                        <Crosshair className="w-3.5 h-3.5" />
                        Kiemelt csatatér
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
                        Átlagos körzet
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Összes jelölt a körzetben</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{data.allCandidates.length} fő</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <ShieldAlert className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Aktív (versenyben lévő) jelöltek</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{data.activeCandidates.length} fő</p>
                    </div>
                </div>
            </div>

            {selectedParty !== 'all' && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">A kiválasztott párt jelöltje</p>
                    {(() => {
                        const orgId = parseInt(selectedParty, 10);
                        const cand = data.allCandidates.find(c =>
                            c.jelolo_szervezetek?.includes(orgId) ||
                            organizations.find(o => o.szkod === orgId)?.coalitionPartnerIds?.some(pid => c.jelolo_szervezetek?.includes(pid))
                        );
                        if (cand) {
                            return (
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">{cand.neve}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cand.statusName}</p>
                                </div>
                            );
                        }
                        return <p className="text-sm italic text-slate-400">Nincs saját jelölt indítva.</p>;
                    })()}
                </div>
            )}
        </div>
    );
}

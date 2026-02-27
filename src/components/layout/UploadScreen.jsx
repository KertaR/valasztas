import { Upload, Database, CloudDownload, Loader2, X } from 'lucide-react';
import { FileStatusCard, ToastContainer } from '../ui';

export default function UploadScreen({
    fetchError,
    fetchDataFromWeb,
    isLoadingWeb,
    handleFileUpload,
    data,
    toast
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans relative transition-colors">
            <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500 transition-colors">
                <div className="bg-blue-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                    <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner rotate-3">
                        <Database className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Választási Elemző Rendszer</h1>
                    <p className="text-blue-100 mt-2 font-medium">Országgyűlési Választások 2026</p>
                </div>

                <div className="p-8">
                    {fetchError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 transition-colors">
                            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span><strong>Hiba:</strong> {fetchError}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            onClick={fetchDataFromWeb} disabled={isLoadingWeb}
                            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                        >
                            {isLoadingWeb ? <Loader2 className="w-6 h-6 animate-spin" /> : <CloudDownload className="w-6 h-6" />}
                            {isLoadingWeb ? 'Adatok letöltése...' : 'Élő adatok betöltése (NVI)'}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800 transition-colors"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-black tracking-widest uppercase transition-colors">Vagy kézi feltöltés</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800 transition-colors"></div>
                        </div>

                        <label className="relative flex justify-center w-full px-4 py-8 transition bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 focus:outline-none group transition-all">
                            <span className="flex flex-col items-center space-y-3">
                                <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 text-center transition-colors">Kattints ide az 5 JSON fájl tallózásához</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center px-4 font-bold uppercase tracking-tighter transition-colors">Megyek, Telepulesek, OevkAdatok, EgyeniJeloltek, Szervezetek</span>
                            </span>
                            <input type="file" multiple accept=".json" className="hidden" onChange={handleFileUpload} />
                        </label>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <FileStatusCard name="Megyek" isLoaded={!!data.megyek} />
                            <FileStatusCard name="Telepulesek" isLoaded={!!data.telepulesek} />
                            <FileStatusCard name="OevkAdatok" isLoaded={!!data.oevk} />
                            <FileStatusCard name="EgyeniJeloltek" isLoaded={!!data.jeloltek} />
                            <FileStatusCard name="Szervezetek" isLoaded={!!data.szervezetek} />
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer toast={toast} />
        </div>
    );
}

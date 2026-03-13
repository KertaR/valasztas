import React from 'react';
import { Clock, RefreshCw, Loader2, Printer } from 'lucide-react';
import ElectionCountdown from './ElectionCountdown';

export default function DashboardHeader({
    lastFetchTime,
    autoRefresh,
    setAutoRefresh,
    onRefresh,
    isLoadingWeb,
    handleExportPDF,
    isExporting
}) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Áttekintés</h1>
                <ElectionCountdown />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {/* Utolsó frissítés ideje */}
                {lastFetchTime && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Frissítés: {lastFetchTime.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                )}
                {/* Auto-refresh kapcsoló */}
                {setAutoRefresh && (
                    <button
                        onClick={() => setAutoRefresh(prev => !prev)}
                        title={autoRefresh ? 'Auto-frissítés kikapcsolása' : 'Nincs auto-frissítés'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${autoRefresh
                            ? 'bg-slate-900 text-white dark:bg-black border-red-500/50 hover:bg-slate-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {autoRefresh ? (
                            <>
                                <div className="relative flex items-center justify-center w-3 h-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                </div>
                                <span className="tracking-widest uppercase shadow-black drop-shadow-md">LIVE</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Auto-off</span>
                            </>
                        )}
                    </button>
                )}
                {/* Kézi azonnali frissítés */}
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isLoadingWeb}
                        title="Azonnali frissítés"
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50"
                    >
                        {isLoadingWeb ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                )}
                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    {isExporting ? 'Generálás...' : 'Elmentés PDF-ként'}
                </button>
            </div>
        </div>
    );
}

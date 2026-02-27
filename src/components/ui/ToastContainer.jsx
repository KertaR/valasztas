import { CheckCircle, X, Info } from 'lucide-react';

export default function ToastContainer({ toast }) {
    if (!toast) return null;
    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border font-medium ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                {toast.type === 'error' && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                <span className="text-sm md:text-base">{toast.message}</span>
            </div>
        </div>
    );
}

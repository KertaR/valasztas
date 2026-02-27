import { CheckCircle } from 'lucide-react';

export default function FileStatusCard({ name, isLoaded }) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all duration-300 ${isLoaded ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`font-bold ${isLoaded ? 'text-green-800' : 'text-slate-500'}`}>{name}</span>
            {isLoaded && <CheckCircle className="w-5 h-5 text-green-600 animate-in zoom-in" />}
        </div>
    );
}

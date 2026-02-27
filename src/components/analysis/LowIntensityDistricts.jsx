import { ShieldAlert, MapPin } from 'lucide-react';

export default function LowIntensityDistricts({ districts, onSelect }) {
    return (
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-8 overflow-hidden relative group transition-colors">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-1000"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/20 rounded-lg ring-1 ring-blue-500/50">
                        <ShieldAlert className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-black">Alacsony Intenzitású Körzetek</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {districts.map((oevk, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelect(oevk)}
                            className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <MapPin className="w-5 h-5 text-blue-400" />
                                <div className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">Veszélyes</div>
                            </div>
                            <p className="font-bold text-sm leading-tight text-white/90 mb-1">{oevk.evk_nev}</p>
                            <p className="text-2xl font-black text-white">
                                {oevk.candidateCount} <span className="text-xs font-normal text-white/50 lowercase italic ml-1">jelölt</span>
                            </p>
                        </div>
                    ))}
                    {districts.length === 0 && (
                        <div className="lg:col-span-4 p-8 text-center text-white/40">Nincsenek kirívóan alacsony versenyű körzetek.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

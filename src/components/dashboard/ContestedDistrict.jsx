import { Activity, ChevronRightCircle } from 'lucide-react';

export default function ContestedDistrict({ district, onClick }) {
    if (!district) return null;

    return (
        <div
            onClick={() => onClick(district)}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-md border border-indigo-800 p-5 md:p-6 text-white relative overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-24 h-24" />
            </div>
            <div className="relative z-10">
                <h3 className="text-indigo-100 font-semibold uppercase tracking-wider text-xs mb-2">Legkiélezettebb Választókerület</h3>
                <p className="font-bold text-xl leading-tight mb-4 pr-6">{district.evk_nev}</p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="text-2xl font-black">{district.candidateCount}</span>
                        <span className="text-[10px] ml-2 font-bold uppercase opacity-80">Jelölt</span>
                    </div>
                    <ChevronRightCircle className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
    );
}

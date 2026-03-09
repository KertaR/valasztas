import React from 'react';
import { Building2 } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

export default function OrganizationLogo({
    emblema,
    nev,
    r_nev,
    sizeClass = "w-14 h-14",
    imageContainerClass = "rounded-2xl border-2 border-slate-100 dark:border-slate-700 p-1.5",
    fallbackContainerClass = "rounded-2xl border-2 border-slate-100 dark:border-slate-700",
    iconClass = "w-6 h-6 text-slate-300 dark:text-slate-600"
}) {
    if (emblema) {
        return (
            <div className={`${sizeClass} bg-white ${imageContainerClass} shadow-sm flex items-center justify-center relative z-10 overflow-hidden flex-shrink-0 transition-colors`}>
                <img
                    src={getImageUrl(emblema)}
                    alt={r_nev || nev}
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                    }}
                />
                <Building2 className={`${iconClass} hidden`} />
            </div>
        );
    }

    return (
        <div className={`${sizeClass} bg-slate-50 dark:bg-slate-800 ${fallbackContainerClass} shadow-sm flex items-center justify-center relative z-10 flex-shrink-0 transition-colors`}>
            <Building2 className={iconClass} />
        </div>
    );
}

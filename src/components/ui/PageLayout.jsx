import React from 'react';
import { motion } from 'framer-motion';

export default function PageLayout({
    title,
    subtitle,
    icon: Icon,
    iconColorClass = "text-blue-600 dark:text-blue-400",
    actions,
    children,
    contentRef,
    maxWidthClass = "max-w-7xl"
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`space-y-6 ${maxWidthClass} mx-auto pb-10 transition-colors`}>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 transition-colors">
                        {Icon && <Icon className={`w-8 h-8 ${iconColorClass} transition-colors`} />}
                        {title}
                    </h1>
                    {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">{subtitle}</p>}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            <div ref={contentRef} className="space-y-6 pt-2 pb-4 px-2 -mx-2 sm:mx-0 sm:px-0 rounded-3xl sm:bg-transparent transition-colors">
                {children}
            </div>
        </motion.div>
    );
}

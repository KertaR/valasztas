import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none"
                >
                    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pointer-events-auto">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hidden sm:block shrink-0">
                                <Cookie className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                                    <Cookie className="w-4 h-4 sm:hidden text-blue-500" />
                                    Sütiket használunk
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 pr-4">
                                    Az oldal a megfelelő működés (pl. sötét mód megjegyzése) és a böngészési élmény javítása érdekében sütiket használ. 
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                            <button
                                onClick={acceptCookies}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Elfogadom
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none hidden sm:block"
                                title="Bezárás"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ children, onClose, maxWidthClass = 'max-w-4xl', className = '', showCloseButton = true }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
                    className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${maxWidthClass} max-h-[90vh] overflow-hidden flex flex-col transition-colors relative ${className}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-slate-900/10 dark:bg-slate-100/10 hover:bg-slate-900/20 dark:hover:bg-slate-100/20 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Modal;

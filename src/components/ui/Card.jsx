import React from 'react';

/**
 * Premium Card component with glassmorphism and modern aesthetics
 */
const Card = ({ children, className = '', ...props }) => {
    return (
        <div 
            className={`
                bg-white/80 dark:bg-slate-900/80 
                backdrop-blur-xl 
                border border-white/40 dark:border-slate-800/50 
                rounded-[2.5rem] 
                shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
                dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                transition-all duration-500
                hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.12)]
                dark:hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.4)]
                overflow-hidden
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

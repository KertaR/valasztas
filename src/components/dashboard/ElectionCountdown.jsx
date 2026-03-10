import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function ElectionCountdown({ targetDate = '2026-04-12T06:00:00' }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000); // Update every second

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
        return null;
    }

    return (
        <div className="flex items-center gap-2.5 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500 shadow-[0_0_5px_#ef4444]"></span>
            </div>

            <div className="flex items-center gap-1 font-black tracking-tight text-sm z-10 text-slate-100">
                <span>{timeLeft.days} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">nap</span></span>
                <span className="opacity-30 text-slate-500 mx-0.5">•</span>
                <span>{timeLeft.hours} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">óra</span></span>
                <span className="hidden sm:inline-block opacity-30 text-slate-500 mx-0.5">•</span>
                <span className="hidden sm:inline-block">{timeLeft.minutes} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">perc</span></span>
                <span className="hidden md:inline-block opacity-30 text-slate-500 mx-0.5">•</span>
                <span className="hidden md:inline-block tabular-nums text-red-400">{String(timeLeft.seconds).padStart(2, '0')} <span className="text-[10px] text-red-500/80 font-bold uppercase tracking-wider">mp</span></span>
            </div>
        </div>
    );
}

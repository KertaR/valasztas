import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function ElectionCountdown({ targetDate = '2026-04-12T06:00:00' }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60)
                };
            }
            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes) {
        return null;
    }

    return (
        <div className="flex items-center gap-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-colors">
            <Clock className="w-4 h-4" />
            <div className="flex items-center gap-1 font-black tracking-tight text-sm">
                <span>{timeLeft.days} nap</span>
                <span className="opacity-50">•</span>
                <span>{timeLeft.hours} óra</span>
                <span className="hidden sm:inline-block opacity-50">•</span>
                <span className="hidden sm:inline-block">{timeLeft.minutes} perc</span>
            </div>
            <span className="hidden md:inline-block text-xs font-semibold opacity-70 ml-1">a választásokig</span>
        </div>
    );
}

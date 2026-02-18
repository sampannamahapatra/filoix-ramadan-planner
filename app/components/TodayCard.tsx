'use client';

import { useState, useEffect } from 'react';
import { DaySchedule } from '../lib/types';
import { motion } from 'framer-motion';
import { Moon, Clock } from 'lucide-react';
import { translations } from '../lib/translations';

interface Props {
    schedule: DaySchedule;
    nextSchedule?: DaySchedule;
}

export default function TodayCard({ schedule, nextSchedule }: Props) {
    const t = translations.bn;
    const [timeLeft, setTimeLeft] = useState('');
    const [progress, setProgress] = useState(0);
    const [nextEvent, setNextEvent] = useState<'Sehri' | 'Iftar'>('Iftar');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDate = now.getDate();

            // Helper to parse time "4:41 AM" to Date object
            const parseTime = (timeStr: string, isNextDay = false) => {
                const [time, period] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                const date = new Date(currentYear, currentMonth, currentDate + (isNextDay ? 1 : 0), hours, minutes, 0);
                return date;
            };

            const sehriTime = parseTime(schedule.sehri);
            const iftarTime = parseTime(schedule.iftar);
            let targetTime = sehriTime;
            let eventType: 'Sehri' | 'Iftar' = 'Sehri';
            let startTime = new Date(currentYear, currentMonth, currentDate, 0, 0, 0); // Default start of day

            if (now < sehriTime) {
                // Before Sehri: Counting down to Sehri
                targetTime = sehriTime;
                eventType = 'Sehri';
                // Progress start could be previous Iftar or Midnight. Let's use Midnight for simplicity OR look back.
                // Better visualization: 0% at midnight, 100% at Sehri?
                // Or simplified: Just 0-100 based on a fixed 4-hour window?
                // Let's use logic: Start of 'night' segment is Iftar yesterday.
                // For simplicity, let's say start is 00:00 today.
                startTime = new Date(currentYear, currentMonth, currentDate, 0, 0, 0);
            } else if (now >= sehriTime && now < iftarTime) {
                // Fasting time: Counting down to Iftar
                targetTime = iftarTime;
                eventType = 'Iftar';
                startTime = sehriTime;
            } else {
                // After Iftar: Counting down to NEXT DAY Sehri
                if (nextSchedule) {
                    targetTime = parseTime(nextSchedule.sehri, true);
                    eventType = 'Sehri';
                    startTime = iftarTime;
                } else {
                    // Fallback if no next schedule (end of Ramadan)
                    targetTime = iftarTime; // Keep showing Iftar passed
                    eventType = 'Iftar';
                }
            }

            setNextEvent(eventType);

            const diff = targetTime.getTime() - now.getTime();
            if (diff > 0) {
                const h = Math.floor((diff / (1000 * 60 * 60)));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

                // Calculate Progress
                const totalDuration = targetTime.getTime() - startTime.getTime();
                const elapsed = now.getTime() - startTime.getTime();
                const prog = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                setProgress(prog);
            } else {
                setTimeLeft('00:00:00');
                setProgress(100);
            }

        }, 1000);
        return () => clearInterval(timer);
    }, [schedule, nextSchedule]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group"
        >
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-all duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                {/* Left Info */}
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-xs font-medium uppercase tracking-wider mb-4">
                        <Moon size={12} />
                        <span>{t.ramadan} {schedule.day}</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-2 tracking-tight">
                        {schedule.date.split(' ')[0]}
                        <span className="text-2xl md:text-3xl text-gray-400 font-sans font-normal ml-2">{schedule.date.split(' ').slice(1).join(' ')}</span>
                    </h1>

                    <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                        <Clock size={16} className="text-gold-500" />
                        <span>{t.fajr}: <span className="text-white font-medium">{schedule.fajr}</span></span>
                    </p>
                </div>

                {/* Center/Right Radial Timer */}
                <div className="relative flex items-center justify-center">
                    {/* SVG Circle for Progress */}
                    <svg className="w-48 h-48 transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                        <circle
                            cx="96" cy="96" r="88"
                            stroke="currentColor" strokeWidth="6" fill="transparent"
                            className="text-gold-500 transition-all duration-1000 ease-linear"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">{t.timeLeft}</span>
                        <span className="text-3xl font-bold font-mono text-white tabular-nums">{timeLeft}</span>
                        <span className="text-emerald-400 text-xs font-medium mt-1">{t.next}: {nextEvent}</span>
                    </div>
                </div>

                {/* Right Stats */}
                <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <p className="text-xs text-gray-400 mb-1">{t.sehri}</p>
                        <p className="text-2xl font-bold text-white font-serif">{schedule.sehri}</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-gold-500/20 to-gold-600/5 p-4 rounded-2xl border border-gold-500/20 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gold-400/10 blur-xl" />
                        <p className="text-xs text-gold-400 mb-1 relative z-10">{t.iftar}</p>
                        <p className="text-2xl font-bold text-gold-400 font-serif relative z-10">{schedule.iftar}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

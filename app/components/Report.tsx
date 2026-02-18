'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { getMonthProgress } from '../lib/actions';

interface DayProgress {
    completed: number;
    total: number;
}

export default function Report() {
    const [monthProgress, setMonthProgress] = useState<Record<string, DayProgress>>({});
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const serverData = await getMonthProgress();
        if (Object.keys(serverData).length > 0) {
            setMonthProgress(serverData);
            setIsGuest(false);
        } else {
            // Guest: read from localStorage
            setIsGuest(true);
            const guestPlan = localStorage.getItem('guest_selected_plan') || 'INDEPENDENT';
            const planTaskCounts: Record<string, number> = { BEGINNER: 8, ADVANCED: 12, INDEPENDENT: 7 };
            const taskCount = planTaskCounts[guestPlan] || 7;
            const progress: Record<string, DayProgress> = {};
            for (let i = 0; i < 35; i++) {
                const d = new Date();
                d.setDate(d.getDate() - 30 + i);
                const ds = d.toISOString().split('T')[0];
                const savedStr = localStorage.getItem(`guest_planner_${ds}`) || '{}';
                const saved: Record<string, boolean> = JSON.parse(savedStr);
                const completed = Object.values(saved).filter(Boolean).length;
                if (completed > 0) {
                    progress[ds] = { completed, total: taskCount };
                }
            }
            setMonthProgress(progress);
        }
    }

    // Calculate stats
    const dates = Object.keys(monthProgress).sort();
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = monthProgress[today];
    const todayPercent = todayProgress ? Math.round((todayProgress.completed / todayProgress.total) * 100) : 0;

    // Streak calculation
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 30; i++) {
        const ds = checkDate.toISOString().split('T')[0];
        const dayData = monthProgress[ds];
        if (dayData && dayData.completed === dayData.total && dayData.total > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
    }

    // Total completed days
    const completedDays = dates.filter(d => {
        const p = monthProgress[d];
        return p && p.completed === p.total && p.total > 0;
    }).length;

    // Weekly data (last 7 days)
    const weeklyData: { date: string; percent: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const p = monthProgress[ds];
        const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
        weeklyData.push({
            date: ds,
            percent: p ? Math.round((p.completed / p.total) * 100) : 0,
            label: dayNames[d.getDay()]
        });
    }

    // Monthly grid (last 30 days)
    const monthlyGrid: { date: string; percent: number; day: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const p = monthProgress[ds];
        monthlyGrid.push({
            date: ds,
            percent: p ? Math.round((p.completed / p.total) * 100) : 0,
            day: d.getDate()
        });
    }

    // Badge logic
    const badges = [
        { icon: '🔥', name: 'স্ট্রিক মাস্টার', condition: streak >= 3, desc: `পর পর ${streak} দিন সম্পূর্ণ` },
        { icon: '⭐', name: 'সুপারস্টার', condition: completedDays >= 10, desc: '১০+ দিন সম্পূর্ণ' },
        { icon: '🏆', name: 'চ্যাম্পিয়ন', condition: completedDays >= 20, desc: '২০+ দিন সম্পূর্ণ' },
        { icon: '💎', name: 'ডায়মন্ড', condition: completedDays >= 29, desc: 'পুরো মাস সম্পূর্ণ!' },
    ];

    const getHeatColor = (percent: number) => {
        if (percent === 0) return 'bg-white/5';
        if (percent < 30) return 'bg-red-500/30';
        if (percent < 60) return 'bg-amber-500/30';
        if (percent < 100) return 'bg-emerald-500/30';
        return 'bg-emerald-500/60';
    };

    return (
        <div className="glass rounded-3xl p-6 md:p-8 col-span-1 md:col-span-3 min-h-[500px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-serif font-bold text-white mb-1 flex items-center gap-2 justify-center md:justify-start">
                        <TrendingUp size={24} className="text-emerald-400" />
                        রিপোর্ট ও পরিসংখ্যান
                    </h2>
                    <p className="text-gray-400 text-sm">আপনার রমজানের আমলের অগ্রগতি</p>
                </div>
                <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === mode
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            {mode === 'daily' ? 'আজ' : mode === 'weekly' ? 'সাপ্তাহিক' : 'মাসিক'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-400">{todayPercent}%</p>
                    <p className="text-xs text-gray-400 mt-1">আজকের অগ্রগতি</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Flame size={20} /> {streak}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">দিনের স্ট্রিক</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-gold-400">{completedDays}</p>
                    <p className="text-xs text-gray-400 mt-1">সম্পূর্ণ দিন</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">{dates.length}</p>
                    <p className="text-xs text-gray-400 mt-1">সক্রিয় দিন</p>
                </div>
            </div>

            {/* View Content */}
            {viewMode === 'daily' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Today's circular progress */}
                    <div className="flex items-center justify-center py-8">
                        <div className="relative w-48 h-48">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                                <circle
                                    cx="96" cy="96" r="88"
                                    stroke="currentColor" strokeWidth="8" fill="transparent"
                                    className="text-emerald-500 transition-all duration-1000"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - todayPercent / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white">{todayPercent}%</span>
                                <span className="text-xs text-gray-400 mt-1">আজকের আমল</span>
                                {todayProgress && (
                                    <span className="text-xs text-emerald-400 mt-1">{todayProgress.completed}/{todayProgress.total} সম্পন্ন</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div>
                        <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                            <Trophy size={18} className="text-gold-400" /> ব্যাজ সমূহ
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {badges.map(badge => (
                                <div key={badge.name} className={`rounded-2xl p-4 text-center transition-all ${badge.condition ? 'glass-card border-emerald-500/30' : 'bg-white/5 opacity-40 grayscale'}`}>
                                    <span className="text-3xl">{badge.icon}</span>
                                    <p className="text-sm font-bold text-white mt-2">{badge.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {viewMode === 'weekly' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-end justify-between gap-3 h-64 px-4">
                        {weeklyData.map(day => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-xs text-gray-400">{day.percent}%</span>
                                <div className="w-full bg-white/5 rounded-xl relative overflow-hidden" style={{ height: '200px' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${day.percent}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`absolute bottom-0 w-full rounded-xl ${day.percent === 100 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : day.percent > 0 ? 'bg-gradient-to-t from-emerald-600/60 to-emerald-400/40' : ''}`}
                                    />
                                </div>
                                <span className={`text-xs font-medium ${day.date === today ? 'text-emerald-400' : 'text-gray-500'}`}>{day.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {viewMode === 'monthly' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-400" /> মাসিক হিট ম্যাপ
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                        {monthlyGrid.map(day => (
                            <div
                                key={day.date}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center ${getHeatColor(day.percent)} border border-white/5 transition-all hover:scale-105`}
                                title={`${day.date}: ${day.percent}%`}
                            >
                                <span className="text-xs font-bold text-white/70">{day.day}</span>
                                {day.percent > 0 && <span className="text-[10px] text-emerald-300">{day.percent}%</span>}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 justify-center mt-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/5 border border-white/5"></span> ০%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30"></span> &lt;৩০%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/30"></span> &lt;৬০%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/30"></span> &lt;১০০%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/60"></span> ১০০%</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

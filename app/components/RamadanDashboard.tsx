'use client';

import { useState, useEffect } from 'react';
import { getRamadanData, calculateTimings } from '../lib/data';
import { District, RamadanData, DaySchedule } from '../lib/types';
import DistrictSelector from './DistrictSelector';
import TodayCard from './TodayCard';
import CalendarView from './CalendarView';
import Planner from './Planner';
import DuaCard from './DuaCard';
import Tasbeeh from './Tasbeeh';
import NamesCarousel from './NamesCarousel';
import PromoBanner from './PromoBanner';
import Report from './Report';
import AppDownloadBanner from './AppDownloadBanner';
import { motion, AnimatePresence } from 'framer-motion';

import { translations } from '../lib/translations';

interface Props {
    initialDistrict?: District;
}

export default function RamadanDashboard({ initialDistrict }: Props) {
    const t = translations.bn;
    const [data, setData] = useState<RamadanData | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const [schedule, setSchedule] = useState<DaySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'today' | 'calendar' | 'planner' | 'report'>('today');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        async function init() {
            try {
                const fetchedData = await getRamadanData();
                setData(fetchedData);

                let initial = initialDistrict;
                if (!initial) {
                    const savedDistrictId = localStorage.getItem('selectedDistrictId');
                    const defaultDistrict = fetchedData.districts.find(d => d.name === 'Dhaka') || fetchedData.districts[0];
                    initial = defaultDistrict;

                    if (savedDistrictId) {
                        const saved = fetchedData.districts.find(d => d.id === savedDistrictId);
                        if (saved) initial = saved;
                    }
                }

                setSelectedDistrict(initial);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [initialDistrict]);

    useEffect(() => {
        if (data && selectedDistrict) {
            const calculated = calculateTimings(data.baseSchedule, selectedDistrict.offset);
            setSchedule(calculated);
            if (!initialDistrict) {
                localStorage.setItem('selectedDistrictId', selectedDistrict.id);
            }
        }
    }, [data, selectedDistrict, initialDistrict]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#022c22] text-emerald-500">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    const todayDate = new Date().getDate();
    const todaySchedule = schedule.find(s => parseInt(s.date) === todayDate) || schedule[0];

    const tabs = [
        { key: 'today' as const, label: t.tabToday },
        { key: 'calendar' as const, label: t.tabCalendar },
        { key: 'planner' as const, label: t.tabPlanner },
        { key: 'report' as const, label: 'রিপোর্ট' },
    ];

    return (
        <main className="min-h-screen pb-20 relative overflow-hidden">
            <div className="pattern-overlay opacity-30" />

            {/* Fixed Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#022c22]/90 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/5' : 'bg-transparent'}`}>
                <div className="max-w-6xl mx-auto px-3 md:px-8">
                    {/* Desktop header */}
                    <div className="hidden md:flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <span className="text-lg">🌙</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white leading-tight">
                                    ফিলোইক্স রমজান ক্যালেন্ডার
                                </h1>
                                <p className="text-[10px] text-emerald-400/80 tracking-widest uppercase">{selectedDistrict?.name} • {t.subtitle}</p>
                            </div>
                        </div>
                        <nav className="flex items-center gap-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setView(tab.key)}
                                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${view === tab.key
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Mobile header */}
                    <div className="md:hidden">
                        <div className="flex items-center justify-between h-14">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <span className="text-sm">🌙</span>
                                </div>
                                <span className="text-sm font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">রমজান</span>
                            </div>
                        </div>
                        <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setView(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${view === tab.key
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-gray-400 hover:text-white bg-white/5'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content starts below fixed header */}
            <div className="pt-28 md:pt-24">
                {/* District Selector (only on Today view) */}
                {view === 'today' && (
                    <div className="mb-10 px-4">
                        <AppDownloadBanner />
                        {data && (
                            <DistrictSelector
                                districts={data.districts}
                                selectedDistrict={selectedDistrict}
                                onSelect={(d) => {
                                    setSelectedDistrict(d);
                                    if (!initialDistrict) localStorage.setItem('selectedDistrictId', d.id);
                                }}
                            />
                        )}
                    </div>
                )}

                {/* 99 Names Carousel (only on Today view) */}
                {view === 'today' && (
                    <div className="mb-12">
                        <NamesCarousel />
                    </div>
                )}

                {/* Content Area */}
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {view === 'today' && todaySchedule && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <TodayCard
                                            schedule={todaySchedule}
                                            nextSchedule={schedule.find(s => parseInt(s.date) === todayDate + 1) || schedule[0]}
                                        />
                                        <div className="col-span-1 space-y-6">
                                            <Tasbeeh />
                                        </div>
                                        <DuaCard />
                                    </div>
                                    {/* আমলনামা on homepage */}
                                    <Planner />
                                </div>
                            )}

                            {view === 'calendar' && (
                                <CalendarView fullSchedule={schedule} districtName={selectedDistrict?.name} />
                            )}

                            {view === 'planner' && (
                                <Planner />
                            )}

                            {view === 'report' && (
                                <Report />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <footer className="mt-24 text-center text-gray-500 text-sm pb-8 relative z-10 flex flex-col items-center gap-2">
                    <PromoBanner />
                    <p className="opacity-60 mt-4">{t.dataSource}</p>
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-gray-500 text-xs uppercase tracking-widest">Powered by</span>
                        <a href="https://www.facebook.com/filoix" target="_blank" rel="noopener noreferrer" className="text-xl font-bold font-serif text-white flex items-center gap-1 hover:text-emerald-400 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Filoix
                        </a>
                    </div>
                </footer>
            </div>
        </main>
    );
}

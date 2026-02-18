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
    const [view, setView] = useState<'today' | 'calendar' | 'planner'>('today');

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

    return (
        <main className="min-h-screen pb-20 pt-8 relative overflow-hidden">
            <div className="pattern-overlay opacity-30" />

            {/* Header Section */}
            <header className="mb-8 text-center relative z-10 px-4">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-emerald-200 mb-2 drop-shadow-sm">
                    Filoix Ramadan Calender
                </h1>
                <p className="text-emerald-400 font-medium tracking-widest text-sm uppercase">{selectedDistrict?.name} {t.subtitle}</p>
            </header>

            {/* Searchable District Dropdown */}
            <div className="mb-10 px-4">
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

            {/* 99 Names Carousel */}
            <div className="mb-12">
                <NamesCarousel />
            </div>

            {/* Navigation Tabs - Sticky */}
            <div className="sticky top-4 z-40 flex justify-center mb-10 px-4 pointer-events-none">
                <div className="glass p-1 rounded-2xl flex gap-1 pointer-events-auto shadow-2xl shadow-black/50 backdrop-blur-xl bg-black/40 border border-white/10">
                    <button
                        onClick={() => setView('today')}
                        className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${view === 'today'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {t.tabToday}
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${view === 'calendar'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {t.tabCalendar}
                    </button>
                    <button
                        onClick={() => setView('planner')}
                        className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${view === 'planner'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {t.tabPlanner}
                    </button>
                </div>
            </div>

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
                        )}

                        {view === 'calendar' && (
                            <CalendarView fullSchedule={schedule} />
                        )}

                        {view === 'planner' && (
                            <Planner />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <footer className="mt-24 text-center text-gray-500 text-sm pb-8 relative z-10 flex flex-col items-center gap-2">
                <p className="opacity-60">{t.dataSource}</p>
                <div className="mt-4 flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-xs uppercase tracking-widest">Powered by</span>
                    <span className="text-xl font-bold font-serif text-white flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Filoix
                    </span>
                </div>
            </footer>
        </main>
    );
}

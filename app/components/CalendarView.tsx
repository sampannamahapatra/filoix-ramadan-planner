'use client';

import { DaySchedule } from '../lib/types';
import { motion } from 'framer-motion';

import DownloadButton from './DownloadButton';

interface Props {
    fullSchedule: DaySchedule[];
    districtName?: string;
}

export default function CalendarView({ fullSchedule, districtName }: Props) {
    return (
        <div className="w-full max-w-4xl mx-auto mt-10 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6 px-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">সম্পূর্ণ সময়সূচী</h2>
                <DownloadButton targetId="ramadan-calendar-capture" />
            </div>

            {/* Capture Area */}
            <div id="ramadan-calendar-capture" className="bg-[#022c22] p-4 md:p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                {/* Image Header */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                        <span className="text-2xl">🌙</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-emerald-100 mb-1">
                        রমজান ক্যালেন্ডার ২০২৫
                    </h1>
                    {districtName && (
                        <p className="text-emerald-400 font-medium text-lg">
                            জেলা: {districtName}
                        </p>
                    )}
                </div>

                {/* Table Container */}
                <div className="glass rounded-2xl overflow-hidden bg-[#0f172a]/50 p-1">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-emerald-500/10 text-emerald-400">
                                <tr>
                                    <th className="p-3 md:p-4 font-semibold text-xs md:text-sm">রমজান</th>
                                    <th className="p-3 md:p-4 font-semibold text-xs md:text-sm">তারিখ</th>
                                    <th className="p-3 md:p-4 font-semibold text-xs md:text-sm">সেহরি</th>
                                    <th className="p-3 md:p-4 font-semibold text-xs md:text-sm">ফজর</th>
                                    <th className="p-3 md:p-4 font-semibold text-xs md:text-sm">ইফতার</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {fullSchedule.map((day, idx) => (
                                    <tr
                                        key={day.day}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-3 md:p-4 text-white font-medium text-xs md:text-sm whitespace-nowrap">{day.day}</td>
                                        <td className="p-3 md:p-4 text-gray-300 text-xs md:text-sm whitespace-nowrap">{day.date}</td>
                                        <td className="p-3 md:p-4 text-emerald-200 font-mono text-xs md:text-sm whitespace-nowrap">{day.sehri}</td>
                                        <td className="p-3 md:p-4 text-gray-400 font-mono text-xs md:text-sm whitespace-nowrap">{day.fajr}</td>
                                        <td className="p-3 md:p-4 text-amber-200 font-bold font-mono text-xs md:text-sm whitespace-nowrap">{day.iftar}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Image Footer */}
                <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/5 pt-6 opacity-80">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-[10px] uppercase tracking-widest">Powered by</span>
                        <span className="text-lg font-bold font-serif text-white flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Filoix
                        </span>
                    </div>
                    <p className="text-[10px] text-emerald-500/50 font-mono">ramadan.filoix.com</p>
                </div>
            </div>
        </div>
    );
}

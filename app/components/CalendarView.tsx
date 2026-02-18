'use client';

import { DaySchedule } from '../lib/types';
import { motion } from 'framer-motion';

import DownloadButton from './DownloadButton';

interface Props {
    fullSchedule: DaySchedule[];
}

export default function CalendarView({ fullSchedule }: Props) {
    return (
        <div className="w-full max-w-4xl mx-auto mt-10">
            <div className="flex items-center justify-between mb-6 px-4">
                <h2 className="text-2xl font-bold text-white">Full Schedule</h2>
                <DownloadButton targetId="ramadan-calendar-table" />
            </div>
            <div id="ramadan-calendar-table" className="glass rounded-3xl overflow-hidden bg-[#0f172a]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-emerald-400">
                            <tr>
                                <th className="p-4 font-semibold">Ramadan</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Sehri End</th>
                                <th className="p-4 font-semibold">Fajr</th>
                                <th className="p-4 font-semibold">Iftar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {fullSchedule.map((day, idx) => (
                                <motion.tr
                                    key={day.day}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-4 text-white font-medium">{day.day}</td>
                                    <td className="p-4 text-gray-300">{day.date}</td>
                                    <td className="p-4 text-emerald-200 font-mono">{day.sehri}</td>
                                    <td className="p-4 text-gray-400 font-mono">{day.fajr}</td>
                                    <td className="p-4 text-amber-200 font-bold font-mono">{day.iftar}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

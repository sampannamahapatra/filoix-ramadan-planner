'use client';

import { Users, Activity, ListChecks, Calendar } from 'lucide-react';

interface Props {
    totalUsers: number;
    activeToday: number;
    totalTasbeehs: number;
    totalDeeds: number;
}

export default function AdminStats({ totalUsers, activeToday, totalTasbeehs, totalDeeds }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Users</p>
                    <p className="text-3xl font-bold text-white">{totalUsers}</p>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-purple-500/20 p-4 rounded-xl text-purple-400">
                    <Calendar size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Active Today</p>
                    <p className="text-3xl font-bold text-white">{activeToday}</p>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-gold-500/20 p-4 rounded-xl text-gold-400">
                    <Activity size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Global Tasbeeh</p>
                    <p className="text-3xl font-bold text-white">{totalTasbeehs.toLocaleString()}</p>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400">
                    <ListChecks size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Deeds Completed</p>
                    <p className="text-3xl font-bold text-white">{totalDeeds.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

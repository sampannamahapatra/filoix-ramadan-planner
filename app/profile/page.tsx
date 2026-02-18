import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { LogOut, MapPin, User as UserIcon } from 'lucide-react';
import { getRamadanData } from '../lib/data';

const prisma = new PrismaClient();

export default async function ProfilePage() {
    const session = await auth();
    if (!session) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { tasbeehLogs: true, plannerLogs: true },
    });

    if (!user) redirect('/login');

    const ramadanData = await getRamadanData();
    const selectedDistrict = ramadanData.districts.find(d => d.id === user.districtId) || null;

    // Calculate Stats
    const totalTasbeeh = user.tasbeehLogs.reduce((acc, log) => acc + log.count, 0);
    const totalTasks = user.plannerLogs.filter(l => l.completed).length;

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            <div className="pattern-overlay opacity-30" />

            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="glass rounded-3xl p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                            <UserIcon size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-white">{user.name}</h1>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <form action={async () => {
                        'use server';
                        await signOut();
                    }}>
                        <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors px-4 py-2 hover:bg-white/5 rounded-lg">
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>

                {/* Default Location Settings */}
                <div className="glass rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <MapPin className="text-gold-400" />
                        Default Location
                    </h2>
                    <div className="text-gray-300 mb-4">
                        Current: <span className="text-emerald-400 font-medium">{selectedDistrict?.name || 'Not Set'}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        To change your default location, select a district on the Home page while logged in.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-2xl text-center">
                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Tasbeeh</p>
                        <p className="text-4xl font-mono font-bold text-gold-400">{totalTasbeeh}</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl text-center">
                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Completed Deeds</p>
                        <p className="text-4xl font-mono font-bold text-emerald-400">{totalTasks}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

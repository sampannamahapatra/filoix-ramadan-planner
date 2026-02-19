import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { Download } from 'lucide-react';
import ramadanData from '../lib/ramadan.json';

// Components
import AdminStats from '../components/admin/AdminStats';
import UserGrowthChart from '../components/admin/UserGrowthChart';
import DistrictChart from '../components/admin/DistrictChart';
import TasbeehChart from '../components/admin/TasbeehChart';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
        console.log('Admin Access Denied:', { session, role: session?.user?.role });
        if (!session) redirect('/login');
        // If logged in but not admin, simple redirect or show unauthorized
        // For now, redirect to home
        redirect('/');
    }

    // --- Data Fetching ---

    // 1. Basic Stats
    const userCount = await prisma.user.count();
    const totalTasbeeh = await prisma.tasbeehLog.aggregate({ _sum: { count: true } });
    const totalTasks = await prisma.plannerLog.count({ where: { completed: true } });

    // 2. Active Today (Unique users who logged a task or tasbeeh today)
    const today = new Date().toISOString().split('T')[0]; // Simple YYYY-MM-DD
    // Note: This relies on server time. Ideally should match user timezone logic.

    // We can approximate active users by checking logs with today's date string
    // In a real app we might need more robust timezone handling
    const activePlannerUsers = await prisma.plannerLog.findMany({
        where: { date: today },
        select: { userId: true },
        distinct: ['userId']
    });

    // 3. User Growth (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await prisma.user.findMany({
        where: {
            createdAt: {
                gte: thirtyDaysAgo
            }
        },
        select: { createdAt: true }
    });

    const growthMap = new Map<string, number>();
    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        growthMap.set(dateStr, 0);
    }

    users.forEach(u => {
        const dateStr = u.createdAt.toISOString().split('T')[0];
        if (growthMap.has(dateStr)) {
            growthMap.set(dateStr, (growthMap.get(dateStr) || 0) + 1);
        }
    });

    const userGrowthData = Array.from(growthMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));


    // 4. District Distribution
    const districtGroups = await prisma.user.groupBy({
        by: ['districtId'],
        _count: {
            districtId: true
        }
    });

    const districtData = districtGroups
        .map(g => {
            const districtInfo = ramadanData.districts.find(d => d.id === g.districtId);
            return {
                name: districtInfo?.name || 'Unknown',
                value: g._count.districtId
            };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 districts

    // 5. Top Tasbeehs
    const tasbeehGroups = await prisma.tasbeehLog.groupBy({
        by: ['tasbeehId'],
        _sum: {
            count: true
        },
        orderBy: {
            _sum: {
                count: 'desc'
            }
        },
        take: 5
    });

    // Need to fetch names for these IDs
    const tasbeehDetails = await prisma.tasbeeh.findMany({
        where: {
            id: { in: tasbeehGroups.map(g => g.tasbeehId) }
        }
    });

    const tasbeehData = tasbeehGroups.map(g => {
        const t = tasbeehDetails.find(td => td.id === g.tasbeehId);
        return {
            name: t?.name || 'Unknown',
            count: g._sum.count || 0
        };
    });

    // 6. Detailed User List
    const recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { tasbeehs: true, plannerLogs: true }
            }
        }
    });


    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            <div className="pattern-overlay opacity-30" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-serif font-bold text-white">Admin Dashboard</h1>
                    <div className="flex gap-2">
                        {/* Potential Export Button location */}
                        {/* <button className="btn-secondary text-xs flex items-center gap-1">
                            <Download size={14} /> Export Data
                        </button> */}
                    </div>
                </div>

                {/* 1. Key Metrics Cards */}
                <AdminStats
                    totalUsers={userCount}
                    activeToday={activePlannerUsers.length}
                    totalTasbeehs={totalTasbeeh._sum.count || 0}
                    totalDeeds={totalTasks}
                />

                {/* 2. Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Growth */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">User Growth (30 Days)</h3>
                        <UserGrowthChart data={userGrowthData} />
                    </div>

                    {/* District Distribution */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">User Distribution by District</h3>
                        <DistrictChart data={districtData} />
                    </div>
                </div>

                {/* 3. Secondary Charts & Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Tasbeehs */}
                    <div className="lg:col-span-1 glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Top Tasbeehs</h3>
                        <TasbeehChart data={tasbeehData} />
                    </div>

                    {/* Recent Users Table */}
                    <div className="lg:col-span-2 glass rounded-2xl p-6 overflow-hidden">
                        <h2 className="text-lg font-bold text-white mb-6">Recent Registrations</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                                        <th className="pb-4 pl-4">Name</th>
                                        <th className="pb-4">District</th>
                                        <th className="pb-4">Role</th>
                                        <th className="pb-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-300">
                                    {recentUsers.map(user => {
                                        const district = ramadanData.districts.find(d => d.id === user.districtId);
                                        return (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 pl-4 font-medium text-white">
                                                    <div>{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="py-3 text-emerald-400">
                                                    {district?.name || '-'}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-400 text-xs">
                                                    {user.createdAt.toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

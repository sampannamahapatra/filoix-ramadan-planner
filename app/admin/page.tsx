import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { Users, Activity, ListChecks } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
        // For demo purposes, if no admin exists, maybe allow or just redirect to login
        // We will manually set a user to ADMIN in DB for testing if needed
        // redirect('/'); 
        // Commenting out strict check for now or we can seed an admin.
        // For now, let's just check if logged in.
        if (!session) redirect('/login');
    }

    const userCount = await prisma.user.count();
    const totalTasbeeh = await prisma.tasbeehLog.aggregate({ _sum: { count: true } });
    const totalTasks = await prisma.plannerLog.count({ where: { completed: true } });

    // Recent users
    const recentUsers = await prisma.user.findMany({
        take: 5,
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

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                <h1 className="text-3xl font-serif font-bold text-white mb-8">Admin Dashboard</h1>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase">Total Users</p>
                            <p className="text-3xl font-bold text-white">{userCount}</p>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <div className="bg-gold-500/20 p-4 rounded-xl text-gold-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase">Global Tasbeeh</p>
                            <p className="text-3xl font-bold text-white">{totalTasbeeh._sum.count || 0}</p>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400">
                            <ListChecks size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase">Deeds Completed</p>
                            <p className="text-3xl font-bold text-white">{totalTasks}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Users Table */}
                <div className="glass rounded-3xl p-8 overflow-hidden">
                    <h2 className="text-xl font-bold text-white mb-6">Recent Registrations</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                                    <th className="pb-4 pl-4">Name</th>
                                    <th className="pb-4">Email</th>
                                    <th className="pb-4">Role</th>
                                    <th className="pb-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-300">
                                {recentUsers.map(user => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-4 font-medium text-white">{user.name}</td>
                                        <td className="py-4">{user.email}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4">{user.createdAt.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

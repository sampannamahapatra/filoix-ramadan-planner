'use client';

import { useState } from 'react';
import { updateProfile, changePassword, selectPlan } from '../lib/actions';
import { User, Lock, Save, Loader2, BookOpen } from 'lucide-react';

export default function ProfileForm({ user }: { user: any }) {
    const [name, setName] = useState(user.name || '');
    const [plan, setPlan] = useState(user.selectedPlan || 'INDEPENDENT');
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    async function handleUpdateProfile(formData: FormData) {
        setIsLoading(true);
        setMsg('');
        const res = await updateProfile(null, formData);
        setIsLoading(false);
        if (res?.message) setMsg(res.message);
    }

    async function handlePlanChange(newPlan: string) {
        if (newPlan === plan) return;
        if (!confirm(`Are you sure you want to switch to ${newPlan} plan? This will reset your current planner tasks.`)) return;

        setIsLoading(true);
        setMsg('');
        const res = await selectPlan(newPlan);
        setIsLoading(false);
        if (res?.success) {
            setPlan(newPlan);
            setMsg('Plan updated successfully');
            window.location.reload(); // Reload to reflect new tasks
        } else {
            setMsg('Failed to update plan');
        }
    }

    async function handleChangePassword(formData: FormData) {
        setIsLoading(true);
        setMsg('');
        const res = await changePassword(null, formData);
        setIsLoading(false);
        if (res?.message) setMsg(res.message);
        if (res?.success) setIsPasswordOpen(false);
    }

    return (
        <div className="space-y-6">
            {/* Profile Update */}
            <div className="glass rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <User className="text-emerald-400" />
                    Edit Profile
                </h2>
                <form action={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Plan Selection */}
            <div className="glass rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="text-purple-400" />
                    Ramadan Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['BEGINNER', 'INDEPENDENT', 'ADVANCED'].map((p) => (
                        <button
                            key={p}
                            disabled={isLoading}
                            onClick={() => handlePlanChange(p)}
                            className={`p-4 rounded-xl border transition-all ${plan === p
                                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <span className="block font-bold mb-1">{p}</span>
                            <span className="text-xs opacity-70">
                                {p === 'BEGINNER' && 'Essentials + Daily Quran'}
                                {p === 'INDEPENDENT' && 'Flexible implementation'}
                                {p === 'ADVANCED' && 'Tahajjud + Extra Adhkar'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Password Update */}
            <div className="glass rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lock className="text-gold-400" />
                        Security
                    </h2>
                    <button
                        onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                        className="text-sm text-emerald-400 hover:text-emerald-300"
                    >
                        {isPasswordOpen ? 'Cancel' : 'Change Password'}
                    </button>
                </div>

                {isPasswordOpen && (
                    <form action={handleChangePassword} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Current Password</label>
                            <input
                                name="currentPassword"
                                type="password"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">New Password</label>
                            <input
                                name="newPassword"
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="bg-gold-500 hover:bg-gold-600 text-black font-medium px-6 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Update Password
                        </button>
                    </form>
                )}
            </div>

            {msg && (
                <div className="fixed bottom-8 right-8 glass bg-black/80 px-6 py-4 rounded-xl text-white animate-in slide-in-from-bottom-5">
                    {msg}
                </div>
            )}
        </div>
    );
}

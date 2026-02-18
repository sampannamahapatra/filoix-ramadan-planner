'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerUser } from '@/app/lib/actions';
import Link from 'next/link';

function RegisterButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্টার করুন'}
        </button>
    );
}

export default function RegisterPage() {
    const [state, dispatch, isPending] = useActionState(registerUser, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="pattern-overlay opacity-30" />

            <div className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">অ্যাকাউন্ট তৈরি করুন</h1>
                    <p className="text-emerald-400/80 text-sm uppercase tracking-wider">রমজান প্ল্যানার</p>
                </div>

                <form action={dispatch} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">পুরো নাম</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="আপনার নাম"
                        />
                        {state?.errors?.name && <p className="text-red-400 text-xs mt-1">{state.errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">ইমেইল</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="your@email.com"
                        />
                        {state?.errors?.email && <p className="text-red-400 text-xs mt-1">{state.errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">পাসওয়ার্ড</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="••••••••"
                        />
                        {state?.errors?.password && <p className="text-red-400 text-xs mt-1">{state.errors.password}</p>}
                    </div>

                    <div className="text-red-400 text-sm">
                        {state?.message && <p>{state.message}</p>}
                    </div>

                    <RegisterButton />
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    ইতিমধ্যে অ্যাকাউন্ট আছে? <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">লগইন করুন</Link>
                </div>
            </div>
        </div>
    );
}

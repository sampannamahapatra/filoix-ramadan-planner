'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions'; // We need to add authenticate action
import Link from 'next/link';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? 'Logging in...' : 'Sign In'}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="pattern-overlay opacity-30" />

            <div className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-emerald-400/80 text-sm uppercase tracking-wider">Ramadan Planner</p>
                </div>

                <form action={dispatch} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="hello@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="text-red-400 text-sm h-4">
                        {errorMessage && <p>{errorMessage}</p>}
                    </div>

                    <LoginButton />
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account? <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

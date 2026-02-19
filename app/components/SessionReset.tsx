'use client';

import { useEffect } from 'react';
import { handleInvalidSession } from '../lib/actions';

export default function SessionReset() {
    useEffect(() => {
        handleInvalidSession();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-custom-bg text-white">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400">Restoring session...</p>
            </div>
        </div>
    );
}

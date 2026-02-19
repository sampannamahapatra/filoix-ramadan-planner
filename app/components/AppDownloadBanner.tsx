'use client';

import { Download } from 'lucide-react';

export default function AppDownloadBanner() {
    return (
        <a
            href="/filoix-ramadan-calendar.apk"
            download
            className="block w-full mb-8 group"
        >
            <div className="glass p-4 rounded-2xl flex items-center justify-between border border-emerald-500/30 bg-emerald-900/20 hover:bg-emerald-900/30 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">📱</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight group-hover:text-emerald-200 transition-colors">Download Android App</h3>
                        <p className="text-emerald-400/80 text-xs">Get the full Ramadan experience</p>
                    </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-900/20">
                    <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                </div>
            </div>
        </a>
    );
}

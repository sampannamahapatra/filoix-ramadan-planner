'use client';

import { Facebook, Phone } from 'lucide-react';

export default function PromoBanner() {
    return (
        <div className="bg-emerald-900/50 border-b border-emerald-500/20 text-center py-2 px-4 backdrop-blur-sm relative z-50">
            <div className="text-sm md:text-base font-medium flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-emerald-100">
                <span className="font-serif text-gold-400 tracking-wide">Buy Panjabi From Filoix</span>

                <div className="flex items-center gap-4">
                    <a
                        href="https://www.facebook.com/profile.php/?id=61569690856796"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                        <Facebook size={16} className="text-blue-400 group-hover:text-blue-300" />
                        <span className="underline decoration-emerald-500/50 hover:decoration-white">Facebook Page</span>
                    </a>

                    <a
                        href="https://wa.me/880193751990"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                        <Phone size={16} className="text-green-400 group-hover:text-green-300" />
                        <span>0193751990</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

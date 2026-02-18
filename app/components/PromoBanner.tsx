'use client';

import { Facebook, MessageCircle } from 'lucide-react';

export default function PromoBanner() {
    return (
        <div className="mt-8 border-t border-emerald-500/20 pt-6">
            <div className="text-sm font-medium flex flex-col items-center gap-3 text-emerald-100/80">
                <span className="font-serif text-gold-400 tracking-wide text-base">Buy Panjabi From Filoix</span>

                <div className="flex items-center gap-6">
                    <a
                        href="https://www.facebook.com/profile.php/?id=61569690856796"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                        <Facebook size={18} className="text-blue-400 group-hover:text-blue-300" />
                        <span className="underline decoration-emerald-500/50 hover:decoration-white">Facebook Page</span>
                    </a>

                    <a
                        href="https://wa.me/880193751990"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                        <MessageCircle size={18} className="text-green-400 group-hover:text-green-300" />
                        <span>WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

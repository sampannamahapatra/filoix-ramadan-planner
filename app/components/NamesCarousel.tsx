'use client';

import { motion } from 'framer-motion';

const NAMES = [
    { arabic: "الله", transliteration: "Allah", meaning: "The God" },
    { arabic: "الرَّحْمَنُ", transliteration: "Ar-Rahman", meaning: "The Most Gracious" },
    { arabic: "الرَّحِيمُ", transliteration: "Ar-Rahim", meaning: "The Most Merciful" },
    { arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaning: "The King" },
    { arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Holy" },
    { arabic: "السَّلَامُ", transliteration: "As-Salam", meaning: "The Source of Peace" },
];

export default function NamesCarousel() {
    return (
        <div className="w-full overflow-hidden py-10">
            <h2 className="text-center text-emerald-400 uppercase tracking-widest text-xs font-bold mb-6">He Beautified Everything</h2>
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#022c22] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#022c22] to-transparent z-10" />

                <motion.div
                    className="flex gap-6 w-max px-20"
                    animate={{ x: [0, -100 * NAMES.length] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                    {[...NAMES, ...NAMES, ...NAMES].map((name, idx) => (
                        <div
                            key={idx}
                            className="glass-card px-8 py-6 rounded-2xl min-w-[200px] flex flex-col items-center justify-center transform hover:scale-105 transition-transform"
                        >
                            <h3 className="text-3xl font-bold font-arabic text-gold-500 mb-2">{name.arabic}</h3>
                            <p className="text-white font-medium">{name.transliteration}</p>
                            <p className="text-xs text-gray-400 mt-1">{name.meaning}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

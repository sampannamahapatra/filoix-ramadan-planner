'use client';

import { motion } from 'framer-motion';

const NAMES = [
    { arabic: "الله", bangla: "আল্লাহ", meaning: "সৃষ্টিকর্তা" },
    { arabic: "الرَّحْمَنُ", bangla: "আর-রাহমান", meaning: "পরম করুণাময়" },
    { arabic: "الرَّحِيمُ", bangla: "আর-রাহীম", meaning: "অতি দয়ালু" },
    { arabic: "الْمَلِكُ", bangla: "আল-মালিক", meaning: "সার্বভৌম মালিক" },
    { arabic: "الْقُدُّوسُ", bangla: "আল-কুদ্দুস", meaning: "পবিত্রতম" },
    { arabic: "السَّلَامُ", bangla: "আস-সালাম", meaning: "শান্তির উৎস" },
];

export default function NamesCarousel() {
    return (
        <div className="w-full overflow-hidden py-10">
            <h2 className="text-center text-emerald-400 uppercase tracking-widest text-xs font-bold mb-6">তিনি সবকিছু সুন্দর করেছেন</h2>
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
                            <p className="text-white font-medium">{name.bangla}</p>
                            <p className="text-xs text-gray-400 mt-1">{name.meaning}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

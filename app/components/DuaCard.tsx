'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const DUAS = [
    {
        title: "সেহরির দোয়া",
        arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
        transliteration: "নাওয়াইতু আন আছুমা গাদাম, মিন শাহরি রমাদানাল মুবারাক; ফারদাল্লাকা ইয়া আল্লাহু, ফাতাকাব্বাল মিন্নি ইন্নিকা আনতাস সামিউল আলিম।",
        meaning: "হে আল্লাহ! আমি আগামীকাল পবিত্র রমজানের রোজা রাখার নিয়ত করছি, যা আপনার সন্তুষ্টির জন্য ফরজ করা হয়েছে। অতএব, আমার পক্ষ থেকে তা কবুল করুন। নিশ্চয়ই আপনি সর্বশ্রোতা ও সর্বজ্ঞ।"
    },
    {
        title: "ইফতারের দোয়া",
        arabic: "اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
        transliteration: "আল্লাহুম্মা ইন্নি লাকা ছুমতু ওয়া বিকা আমানতু ওয়া আলাইকা তাওয়াক্কালতু ওয়া আলা রিযক্বিকা আফতারতু।",
        meaning: "হে আল্লাহ! আমি আপনার জন্যই রোজা রেখেছি, আপনার প্রতি ঈমান এনেছি, আপনার উপর ভরসা করেছি এবং আপনার রিযিক দিয়ে ইফতার করেছি।"
    }
];

export default function DuaCard() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="glass-card rounded-3xl p-6 md:p-8 col-span-1 md:col-span-2 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <BookOpen size={120} />
            </div>

            <div className="flex gap-4 mb-6 relative z-10">
                {DUAS.map((dua, idx) => (
                    <button
                        key={dua.title}
                        onClick={() => setActiveTab(idx)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === idx
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {dua.title}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center relative z-10"
                >
                    <h3 className="text-2xl md:text-4xl font-arabic text-gold-400 mb-4 leading-relaxed dir-rtl">
                        {DUAS[activeTab].arabic}
                    </h3>
                    <p className="text-emerald-200/80 mb-2 text-sm md:text-base whitespace-pre-line">
                        {DUAS[activeTab].transliteration}
                    </p>
                    <p className="text-gray-300 text-sm md:text-lg font-serif">
                        {DUAS[activeTab].meaning}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

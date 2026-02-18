'use client';

import { useState } from 'react';
import { District } from '../lib/types';
import { ChevronDown, MapPin, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../lib/translations';

interface Props {
    districts: District[];
    selectedDistrict: District | null;
    onSelect: (d: District) => void;
}

export default function DistrictSelector({ districts, selectedDistrict, onSelect }: Props) {
    const t = translations.bn;
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = districts.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.bn_name.includes(search)
    );

    return (
        <div className="relative w-full max-w-sm mx-auto z-40">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="glass rounded-2xl p-1 flex items-center cursor-pointer group hover:bg-white/5 transition-colors"
            >
                <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                    <MapPin size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 px-4">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t.currentLocation}</p>
                    <h2 className="text-white font-serif font-bold text-lg leading-tight truncate">
                        {selectedDistrict ? `${selectedDistrict.bn_name}` : t.selectDistrict}
                    </h2>
                </div>
                <div className="pr-4">
                    <ChevronDown className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            className="absolute top-full left-0 right-0 mt-4 bg-[#022c22]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[60vh] md:max-h-96 w-full md:w-[120%] md:-left-[10%]"
                        >
                            <div className="p-4 border-b border-white/5 relative">
                                <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all font-sans"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                                {filtered.map(district => (
                                    <button
                                        key={district.id}
                                        onClick={() => {
                                            onSelect(district);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group mb-1 ${selectedDistrict?.id === district.id
                                                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                                                : 'hover:bg-white/5 text-gray-300 border border-transparent'
                                            }`}
                                    >
                                        <div>
                                            <span className="font-medium block font-sans">{district.bn_name}</span>
                                            <span className="text-xs opacity-50 block font-sans">{district.name}</span>
                                        </div>
                                        {selectedDistrict?.id === district.id && <Check size={16} />}
                                    </button>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                        <Search size={32} className="opacity-20" />
                                        <p>{t.notFound}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

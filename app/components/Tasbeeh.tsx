import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Plus, Trash2, Edit2, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { getTasbeehs, updateTasbeehCount, addTasbeeh, deleteTasbeeh, updateTasbeehDetails, resetTasbeehs } from '../lib/actions';
import { translations } from '../lib/translations';

interface TasbeehItem {
    id: string;
    name: string;
    target: number;
    count: number;
}

export default function Tasbeeh() {
    const t = translations.bn;
    const [tasbeehs, setTasbeehs] = useState<TasbeehItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Edit/Add Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editTarget, setEditTarget] = useState(100);

    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newTarget, setNewTarget] = useState(33);

    useEffect(() => {
        loadTasbeehs();
    }, []);

    async function loadTasbeehs() {
        const data = await getTasbeehs();
        setTasbeehs(data);
        setLoading(false);
    }

    const currentTasbeeh = tasbeehs[currentIndex];

    const handleCount = () => {
        if (!currentTasbeeh) return;
        const newCount = currentTasbeeh.count + 1;
        updateLocalTasbeeh(currentTasbeeh.id, newCount);
        // Debounce server update normally, but for now direct is ok or use a specialized hook
        updateTasbeehCount(currentTasbeeh.id, newCount, new Date().toISOString().split('T')[0]);
    };

    const handleReset = () => {
        if (!currentTasbeeh || !confirm('Reset count?')) return;
        updateLocalTasbeeh(currentTasbeeh.id, 0);
        updateTasbeehCount(currentTasbeeh.id, 0, new Date().toISOString().split('T')[0]);
    };

    const updateLocalTasbeeh = (id: string, count: number) => {
        setTasbeehs(prev => prev.map(t => t.id === id ? { ...t, count } : t));
    };

    const handleAdd = async () => {
        if (!newName) return;
        await addTasbeeh(newName, newTarget);
        setIsAdding(false);
        setNewName('');
        loadTasbeehs();
    };

    const handleDelete = async () => {
        if (!currentTasbeeh || !confirm('Delete this Tasbeeh?')) return;
        await deleteTasbeeh(currentTasbeeh.id);
        setCurrentIndex(0);
        loadTasbeehs();
    };

    const handleUpdate = async () => {
        if (!currentTasbeeh) return;
        await updateTasbeehDetails(currentTasbeeh.id, editName, editTarget);
        setIsEditing(false);
        loadTasbeehs();
    };

    if (loading) {
        return (
            <div className="glass rounded-3xl p-6 relative overflow-hidden h-[300px] flex flex-col justify-between animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="w-8 h-8 bg-white/10 rounded-full" />
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="w-32 h-6 bg-white/10 rounded" />
                        <div className="w-16 h-4 bg-white/5 rounded" />
                    </div>
                    <div className="w-8 h-8 bg-white/10 rounded-full" />
                </div>
                <div className="self-center w-32 h-32 rounded-full border-4 border-white/5 bg-white/5" />
                <div className="flex justify-center gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded" />
                    <div className="w-8 h-8 bg-white/10 rounded" />
                    <div className="w-8 h-8 bg-white/10 rounded" />
                </div>
            </div>
        );
    }

    if (tasbeehs.length === 0) {
        return (
            <div className="glass rounded-3xl p-6 relative overflow-hidden group min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-emerald-900/20" />
                <div className="relative z-10 space-y-6 max-w-xs mx-auto">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 ring-1 ring-emerald-500/30">
                        <Plus size={32} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-white mb-2">Start Your Dhikr</h3>
                        <p className="text-gray-400 text-sm">Create your first Tasbeeh or load the recommended set for Ramadan.</p>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all font-medium flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Create Custom
                        </button>
                        <button
                            onClick={async () => {
                                if (!confirm("Reset to default tasbeehs? This will delete your current list.")) return;
                                setLoading(true);
                                await resetTasbeehs();
                                await loadTasbeehs();
                            }}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 rounded-xl transition-all font-medium text-sm"
                        >
                            Load Defaults
                        </button>
                    </div>
                </div>

                {/* Add New Overlay - Reused Logic */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-6"
                        >
                            <div className="w-full max-w-sm space-y-4">
                                <h4 className="text-xl font-serif text-gold-400 text-center">New Tasbeeh</h4>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 ml-1">Zikr Name</label>
                                        <input
                                            placeholder="e.g. SubhanAllah"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 ml-1">Target Count</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[33, 100, 313, 1000].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => setNewTarget(val)}
                                                    className={`py-2 rounded-lg text-sm border ${newTarget === val ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="number"
                                            value={newTarget}
                                            onChange={e => setNewTarget(Number(e.target.value))}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 mt-2 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button onClick={() => setIsAdding(false)} className="py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors">Cancel</button>
                                    <button onClick={handleAdd} className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all">Create</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="glass rounded-3xl p-6 relative overflow-hidden group min-h-[300px] flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%">
                    <pattern id="tasbeeh-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-white" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#tasbeeh-pattern)" />
                </svg>
            </div>

            {/* Header / Navigation */}
            <div className="flex items-center justify-between relative z-10 w-full">
                <button
                    onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : tasbeehs.length - 1)}
                    className="p-3 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white active:scale-95"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="text-center flex-1 mx-2">
                    {isEditing ? (
                        <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-200">
                            <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-1 text-center text-sm w-full focus:outline-none"
                            />
                            <div className="flex items-center justify-center gap-2">
                                <input
                                    type="number"
                                    value={editTarget}
                                    onChange={e => setEditTarget(Number(e.target.value))}
                                    className="bg-black/40 border border-emerald-500/30 rounded-lg px-2 py-1 text-center text-xs w-20 focus:outline-none"
                                />
                                <button onClick={handleUpdate} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-500">Save</button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-gold-400 font-serif text-xl font-medium tracking-wide truncate max-w-[200px] mx-auto">{currentTasbeeh?.name}</h3>
                            <p className="text-xs text-emerald-400/80 font-medium tracking-wider uppercase mt-1">Target: {currentTasbeeh?.target}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setCurrentIndex(prev => prev < tasbeehs.length - 1 ? prev + 1 : 0)}
                    className="p-3 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white active:scale-95"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Main Counter */}
            {!isAdding && currentTasbeeh && (
                <div className="flex flex-col items-center justify-center relative z-10 flex-1 py-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCount}
                        className="w-40 h-40 rounded-full border-[6px] border-white/5 flex items-center justify-center bg-gradient-to-b from-emerald-900/40 to-black/60 shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:shadow-[0_0_60px_rgba(16,185,129,0.2)] transition-all relative group-hover:border-emerald-500/20"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-mono font-bold text-white tracking-tighter drop-shadow-lg">
                                {currentTasbeeh.count}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Count</span>
                        </div>

                        {/* Progress Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible">
                            {/* Background Circle */}
                            <circle
                                cx="50%" cy="50%" r="76"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                className="text-white/5"
                            />
                            {/* Active Circle */}
                            <circle
                                cx="50%" cy="50%" r="76"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                                className="text-emerald-500 transition-all duration-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                strokeDasharray={477} // 2 * pi * 76
                                strokeDashoffset={477 - (Math.min(currentTasbeeh.count / currentTasbeeh.target, 1) * 477)}
                            />
                        </svg>
                    </motion.button>
                </div>
            )}

            {/* Actions Footer */}
            {!isAdding && (
                <div className="flex items-center justify-center gap-6 relative z-10">
                    <button
                        onClick={handleReset}
                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        title="Reset Count"
                    >
                        <RotateCcw size={18} />
                    </button>

                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 hover:scale-105 hover:bg-emerald-500 transition-all active:scale-95"
                        title="Add New"
                    >
                        <Plus size={24} />
                    </button>

                    <button
                        onClick={() => {
                            setEditName(currentTasbeeh.name);
                            setEditTarget(currentTasbeeh.target);
                            setIsEditing(!isEditing);
                        }}
                        className={`p-2.5 rounded-xl transition-all ${isEditing ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10'}`}
                        title="Edit Details"
                    >
                        <Edit2 size={18} />
                    </button>

                    <button
                        onClick={handleDelete}
                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        title="Delete Tasbeeh"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            {/* Add New Overlay (Same as empty state but absolute) */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-6"
                    >
                        <div className="w-full max-w-sm space-y-4">
                            <h4 className="text-xl font-serif text-gold-400 text-center">New Tasbeeh</h4>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 ml-1">Zikr Name</label>
                                    <input
                                        placeholder="e.g. SubhanAllah"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 ml-1">Target Count</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[33, 100, 313, 1000].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setNewTarget(val)}
                                                className={`py-2 rounded-lg text-sm border ${newTarget === val ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        value={newTarget}
                                        onChange={e => setNewTarget(Number(e.target.value))}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 mt-2 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button onClick={() => setIsAdding(false)} className="py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors">Cancel</button>
                                <button onClick={handleAdd} className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all">Create</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

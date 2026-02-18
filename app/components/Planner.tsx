import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, LayoutGrid, Calendar as CalIcon, Settings, ChevronLeft, ChevronRight, ArrowRight, Eye, List } from 'lucide-react';
import { translations } from '../lib/translations';
import { getPlannerSetup, togglePlannerTask, addPlannerTask, deletePlannerTask, selectPlan, getMonthProgress, resetPlanner } from '../lib/actions';
import { RAMADAN_SCHEDULE } from '../lib/schedule-data';

interface PlannerTask {
    id: string;
    name: string;
    category: string;
    isSystem: boolean;
    completed: boolean;
}

export default function Planner() {
    const t = translations.bn;
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [currentPlan, setCurrentPlan] = useState<string>('');
    const [dateStr, setDateStr] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'daily' | 'grid'>('daily');
    const [monthProgress, setMonthProgress] = useState<Record<string, { completed: number, total: number }>>({});

    // UI State
    const [showPlanSelection, setShowPlanSelection] = useState(false);
    const [previewPlan, setPreviewPlan] = useState<string | null>(null);

    // Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [addCategory, setAddCategory] = useState('');

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDateStr(today);
        loadTasks(today);
        loadProgress();
    }, []);

    async function loadTasks(date: string) {
        setLoading(true);
        const data = await getPlannerSetup(date);

        if ('plan' in data) {
            setTasks(data.tasks);
            setCurrentPlan(data.plan);
            // Show plan selection if no tasks found (first time user or reset)
            if (data.tasks.length === 0) {
                setShowPlanSelection(true);
            }
        } else {
            setTasks([]);
        }
        setLoading(false);
    }

    async function loadProgress() {
        const prog = await getMonthProgress();
        setMonthProgress(prog);
    }

    const handleStartPlan = async (plan: string) => {
        if (tasks.length > 0 && !confirm(`আপনি কি নতুন প্ল্যান শুরু করতে চান? এটি আপনার আগের ডাটা রিসেট করবে।`)) return;
        setLoading(true);
        await selectPlan(plan);
        await loadTasks(dateStr);
        await loadProgress();
        setPreviewPlan(null);
        setShowPlanSelection(false);
    };

    const handleForceReset = async () => {
        if (!confirm("সম্পূর্ণ ডাটা রিসেট করবেন?")) return;
        setLoading(true);
        await resetPlanner();
        await loadTasks(dateStr);
        await loadProgress();
    };

    const categories = [
        { key: 'Obligatory', label: t.categories.Obligatory, allowAdd: false },
        { key: 'Spiritual', label: t.categories.Spiritual, allowAdd: true },
        { key: 'GoodDeeds', label: t.categories['Good Deeds'], allowAdd: true }
    ];

    const handleToggle = async (task: PlannerTask) => {
        const newStatus = !task.completed;
        const newTasks = tasks.map(t => t.id === task.id ? { ...t, completed: newStatus } : t);
        setTasks(newTasks);
        await togglePlannerTask(task.id, newStatus, dateStr);
        loadProgress();
    };

    const handleAdd = async () => {
        if (!newTaskName.trim() || !addCategory) return;
        setIsAdding(true);
        await addPlannerTask(newTaskName, addCategory);
        setNewTaskName('');
        setAddCategory('');
        setIsAdding(false);
        loadTasks(dateStr);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('মুছে ফেলবেন?')) return;
        await deletePlannerTask(id);
        setTasks(tasks.filter(t => t.id !== id));
    };


    const totalProgress = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

    const generateCalendarGrid = () => {
        const today = new Date(); // In real app, sync with Ramadan start
        const start = new Date(today);
        start.setDate(today.getDate() - 5);
        const days = [];
        for (let i = 0; i < 35; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const gridDays = generateCalendarGrid();

    // --- HELPER: Get Dynamic Task Name ---
    const getTaskDisplayName = (originalName: string) => {
        if (originalName === "Daily Quran Target") {
            // Calculate Ramadan Day (Mock: assuming Day 1 = Today for demo, or based on date)
            // For now, let's just assume Day 1 for simplicity or use a modulo to show variation
            // In production, diff current date vs Ramadan Start Date
            const today = new Date();
            const startOfRamadan = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Mock: Start Today
            const dayDiff = Math.floor((new Date(dateStr).getTime() - startOfRamadan.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const ramadanDay = Math.max(1, Math.min(30, dayDiff)); // Clamp 1-30

            if (currentPlan === 'BEGINNER' && RAMADAN_SCHEDULE.BEGINNER[ramadanDay - 1]) {
                return `কুরআন: ${RAMADAN_SCHEDULE.BEGINNER[ramadanDay - 1].quran}`;
            }
            if (currentPlan === 'ADVANCED' && RAMADAN_SCHEDULE.ADVANCED[ramadanDay - 1]) {
                return `কুরআন: ${RAMADAN_SCHEDULE.ADVANCED[ramadanDay - 1].quran}`;
            }
        }

        // Translate static keys if exists
        return t.tasks[originalName as keyof typeof t.tasks] || originalName;
    };


    // --- COMPONENTS ---

    const PlanPreview = ({ planKey, onClose }: { planKey: string, onClose: () => void }) => {
        const schedule = planKey === 'BEGINNER' ? RAMADAN_SCHEDULE.BEGINNER : RAMADAN_SCHEDULE.ADVANCED;
        const title = planKey === 'BEGINNER' ? "সহজ প্ল্যান (৩০ দিন)" : "চ্যালেঞ্জ প্ল্যান (৩০ দিন)";

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col relative overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-900/20 to-transparent">
                        <div>
                            <h3 className="text-2xl font-serif text-white">{title}</h3>
                            <p className="text-gray-400 text-sm">সম্পূর্ণ ৩০ দিনের রুটিন একনজরে দেখুন</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-emerald-600/20 scrollbar-track-transparent">
                        {schedule.map((day) => (
                            <div key={day.day} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                    {day.day}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">রমজান {day.day}</h4>
                                    <p className="text-gray-400 text-sm">{day.quran}</p>
                                    <p className="text-xs text-gray-500 mt-1">+ ৫ ওয়াক্ত নামাজ + তারাবীহ</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/20">
                        <button
                            onClick={() => handleStartPlan(planKey)}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            এই চ্যালেঞ্জ শুরু করুন <ArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const PlanCard = ({ title, description, planKey, colorClass }: { title: string, description: string, planKey: string, colorClass: string }) => (
        <div className="glass p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all group flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                <LayoutGrid size={80} />
            </div>
            <h3 className={`text-2xl font-serif font-bold mb-3 ${colorClass}`}>{title}</h3>
            <p className="text-gray-400 text-sm mb-6 flex-1 leading-relaxed">{description}</p>

            <div className="flex gap-3 mt-auto">
                {planKey !== 'INDEPENDENT' && (
                    <button
                        onClick={() => setPreviewPlan(planKey)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <Eye size={16} /> প্রিভিউ
                    </button>
                )}
                <button
                    onClick={() => handleStartPlan(planKey)}
                    className={`flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 ${planKey === 'INDEPENDENT' ? 'w-full' : ''}`}
                >
                    শুরু করুন <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );

    if (loading && tasks.length === 0) return (
        <div className="glass rounded-3xl p-6 md:p-8 col-span-1 md:col-span-3 min-h-[500px] animate-pulse flex items-center justify-center">
            <div className="text-emerald-500/50 text-xl font-serif">লোড হচ্ছে...</div>
        </div>
    );

    // PLAN SELECTION VIEW
    if (showPlanSelection) {
        return (
            <div className="glass rounded-3xl p-8 col-span-1 md:col-span-3 min-h-[500px]">
                {previewPlan && <PlanPreview planKey={previewPlan} onClose={() => setPreviewPlan(null)} />}

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-serif font-bold text-white mb-2">আপনার প্ল্যান বেছে নিন</h2>
                        <p className="text-gray-400">এই রমজানে আপনার ইবাদতের লক্ষ্য নির্ধারণ করুন</p>
                    </div>
                    {tasks.length > 0 && (
                        <button onClick={() => setShowPlanSelection(false)} className="text-gray-400 hover:text-white text-sm">বাতিল করুন</button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PlanCard
                        title="সহজ প্ল্যান"
                        planKey="BEGINNER"
                        colorClass="text-emerald-400"
                        description="২৭ দিনে ১ বার কুরআন খতম। প্রতিদিন ১.১৫ পারা তিলাওয়াত + ৫ ওয়াক্ত নামাজ + তারাবীহ।"
                    />
                    <PlanCard
                        title="চ্যালেঞ্জ প্ল্যান"
                        planKey="ADVANCED"
                        colorClass="text-gold-400"
                        description="২৭ দিনে ২ বার কুরআন খতম। প্রতিদিন ২.২৫ পারা তিলাওয়াত + তাহাজ্জুদ + আজকার।"
                    />
                    <PlanCard
                        title="ইন্ডিপেন্ডেন্ট"
                        planKey="INDEPENDENT"
                        colorClass="text-blue-400"
                        description="নিজের মত ইবাদত করুন। এখানে কোনো ফিক্সড টার্গেট নেই, আপনি নিজেই যুক্ত করতে পারবেন।"
                    />
                </div>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <button onClick={handleForceReset} className="text-xs text-red-400/60 hover:text-red-400 underline transition-colors">
                        ফোর্স রিসেট ও রিলোড
                    </button>
                </div>
            </div>
        );
    }

    // MAIN DASHBOARD VIEW
    return (
        <div className="glass rounded-3xl p-6 md:p-8 col-span-1 md:col-span-3 min-h-[500px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-serif font-bold text-white mb-1 flex items-center gap-2 justify-center md:justify-start">
                        {t.dailyTracker}
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30 font-sans uppercase tracking-wider ml-2">
                            {currentPlan === 'BEGINNER' ? 'সহজ' : currentPlan === 'ADVANCED' ? 'চ্যালেঞ্জ' : 'স্বাধীন'}
                        </span>
                    </h2>
                    <p className="text-gray-400 text-sm">{new Date(dateStr).toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPlanSelection(true)}
                        className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 hover:bg-emerald-400/20 transition-colors"
                    >
                        প্ল্যান পরিবর্তন
                    </button>
                    <div className="flex bg-black/20 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'daily' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <span className="text-xs font-bold">আজ</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Daily View */}
            {viewMode === 'daily' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {categories.map((cat) => (
                        <div key={cat.key} className="space-y-3">
                            <div className="flex items-center justify-between border-b border-gold-500/20 pb-1">
                                <h3 className="text-gold-400 font-medium text-sm px-1">{cat.label}</h3>
                                {cat.allowAdd && (
                                    <button
                                        onClick={() => {
                                            setAddCategory(cat.key);
                                            setNewTaskName('');
                                        }}
                                        className="text-emerald-400 hover:text-white transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                )}
                            </div>

                            {tasks.filter(t => t.category === cat.key).map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left group relative pr-8 ${task.completed
                                        ? 'bg-emerald-500/20 border-emerald-500/30'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <button
                                        onClick={() => handleToggle(task)}
                                        className="flex items-center gap-3 flex-1"
                                    >
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 group-hover:border-gray-400'
                                            }`}>
                                            {task.completed && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors ${task.completed ? 'text-emerald-300 line-through decoration-emerald-500/50' : 'text-gray-300'
                                            }`}>
                                            {getTaskDisplayName(task.name)}
                                        </span>
                                    </button>

                                    {!task.isSystem && (
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="absolute right-2 p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}

                            {/* Inline Add Input */}
                            {addCategory === cat.key && (
                                <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newTaskName}
                                        onChange={(e) => setNewTaskName(e.target.value)}
                                        placeholder="নতুন কাজ..."
                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                        onBlur={() => !newTaskName && setAddCategory('')}
                                    />
                                    <button
                                        onClick={handleAdd}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-5 md:grid-cols-7 gap-3 animate-in fade-in zoom-in duration-300">
                    {gridDays.map((dayStr, i) => {
                        const dayData = monthProgress[dayStr];
                        const completed = dayData ? dayData.completed : 0;
                        const total = dayData ? dayData.total : 1; // avoid divide by zero
                        const percent = Math.round((completed / total) * 100);
                        const isToday = dayStr === dateStr;
                        const dateObj = new Date(dayStr);

                        return (
                            <button
                                key={dayStr}
                                onClick={() => {
                                    setDateStr(dayStr);
                                    loadTasks(dayStr);
                                    setViewMode('daily'); // Switch back to daily view on click
                                }}
                                className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all group ${isToday
                                    ? 'border-gold-400 bg-gold-400/10 ring-1 ring-gold-400/50'
                                    : 'border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <span className={`text-xs font-medium mb-1 ${isToday ? 'text-gold-400' : 'text-gray-400'}`}>
                                    {dateObj.getDate()}
                                </span>

                                <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center relative">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="16" cy="16" r="14"
                                            stroke="currentColor" strokeWidth="3" fill="none"
                                            className="text-gray-800"
                                        />
                                        <circle
                                            cx="16" cy="16" r="14"
                                            stroke="currentColor" strokeWidth="3" fill="none"
                                            className={`${percent === 100 ? 'text-emerald-400' : percent > 50 ? 'text-yellow-400' : 'text-emerald-800'}`}
                                            strokeDasharray={88}
                                            strokeDashoffset={88 - (percent / 100) * 88}
                                        />
                                    </svg>
                                    <span className="absolute text-[10px] font-bold text-gray-300">{percent}%</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

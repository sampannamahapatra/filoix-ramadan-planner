'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import { auth, signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

const prisma = new PrismaClient();

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function registerUser(prevState: any, formData: FormData) {
    const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        };
    }

    const { name, email, password } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create User. Email might be in use.',
        };
    }
    redirect('/login');
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function syncDistrict(districtId: string) {
    const session = await auth();
    if (!session?.user?.id) return;
    await prisma.user.update({
        where: { id: session.user.id },
        data: { districtId }
    });
}

// --- SEEDING HELPER ---
async function ensureDefaultData(userId: string, plan: string = "INDEPENDENT") {
    // Seed Default Tasbeehs (Common for all)
    // Verify user exists first to avoid P2003 Foreign Key Constraint Violation
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        // If user doesn't exist, we can't create data.
        // The calling function should handle the missing user (likely via the profile page redirect fix)
        // But we return here to prevent the crash.
        return;
    }



    const tasbeehCount = await prisma.tasbeeh.count({ where: { userId } });
    if (tasbeehCount === 0) {
        await prisma.tasbeeh.createMany({
            data: [
                { userId, name: "সুবহানাল্লাহ", target: 1000 },
                { userId, name: "আলহামদুলিল্লাহ", target: 1000 },
                { userId, name: "আল্লাহু আকবার", target: 1000 },
                { userId, name: "আস্তাগফিরুল্লাহ", target: 100 },
                { userId, name: "লা ইলাহা ইল্লাল্লাহ", target: 100 },
                { userId, name: "দরূদ শরীফ", target: 100 },
            ]
        });
    }

    // Seed/Update Planner Tasks based on Plan
    const requiredTasks: { name: string, category: string, isSystem: boolean }[] = [];

    // Core Tasks (Beginner & Advanced)
    if (plan === 'BEGINNER' || plan === 'ADVANCED') {
        const core = [
            // Obligatory
            { name: "Pray Fajr", category: "Obligatory", isSystem: true },
            { name: "Pray Dhuhr", category: "Obligatory", isSystem: true },
            { name: "Pray Asr", category: "Obligatory", isSystem: true },
            { name: "Pray Maghrib", category: "Obligatory", isSystem: true },
            { name: "Pray Isha", category: "Obligatory", isSystem: true },
            // Spiritual
            { name: "Taraweeh", category: "Spiritual", isSystem: true },
        ];
        requiredTasks.push(...core);
    }

    // Specifics
    if (plan === 'BEGINNER') {
        // Generic task - UI will show "Para 1", "Para 2" etc based on day
        requiredTasks.push({ name: "Daily Quran Target", category: "Spiritual", isSystem: true });
        requiredTasks.push({ name: "Give Sadaqah", category: "GoodDeeds", isSystem: false });
    } else if (plan === 'ADVANCED') {
        requiredTasks.push({ name: "Daily Quran Target", category: "Spiritual", isSystem: true });
        requiredTasks.push({ name: "Tahajjud Prayer", category: "Spiritual", isSystem: true });
        requiredTasks.push({ name: "Morning Adhkar", category: "Spiritual", isSystem: false });
        requiredTasks.push({ name: "Evening Adhkar", category: "Spiritual", isSystem: false });
        requiredTasks.push({ name: "Give Sadaqah", category: "GoodDeeds", isSystem: false });
        requiredTasks.push({ name: "No Backbiting", category: "GoodDeeds", isSystem: false });
    } else if (plan === 'INDEPENDENT') {
        // Default starter pack for independent
        const independent = [
            { name: "Pray Fajr", category: "Obligatory", isSystem: true },
            { name: "Pray Dhuhr", category: "Obligatory", isSystem: true },
            { name: "Pray Asr", category: "Obligatory", isSystem: true },
            { name: "Pray Maghrib", category: "Obligatory", isSystem: true },
            { name: "Pray Isha", category: "Obligatory", isSystem: true },
            { name: "Read Quran", category: "Spiritual", isSystem: false },
            { name: "Taraweeh", category: "Spiritual", isSystem: false },
        ];
        requiredTasks.push(...independent);
    }

    if (requiredTasks.length > 0) {
        for (const task of requiredTasks) {
            // Check if exists
            const exists = await prisma.plannerTask.findFirst({
                where: { userId, name: task.name }
            });

            // If it doesn't exist, create it.
            if (!exists) {
                await prisma.plannerTask.create({
                    data: { ...task, userId }
                });
            }
        }
    }
}


// --- TASBEEH ACTIONS ---

export async function getTasbeehs() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        await ensureDefaultData(session.user.id);

        const today = new Date().toISOString().split('T')[0];
        const tasbeehs = await prisma.tasbeeh.findMany({
            where: { userId: session.user.id },
            include: { logs: { where: { date: today } } },
            orderBy: { createdAt: 'asc' }
        });

        return tasbeehs.map(t => ({ ...t, count: t.logs[0]?.count || 0 }));
    } catch (error) {
        console.error("Error fetching tasbeehs:", error);
        return [];
    }
}

export async function addTasbeeh(name: string, target: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.tasbeeh.create({
            data: { userId: session.user.id, name, target }
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding tasbeeh:", e);
        return { error: "Failed to add tasbeeh" };
    }
}

export async function updateTasbeehCount(tasbeehId: string, count: number, date: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return;

        const existing = await prisma.tasbeehLog.findUnique({
            where: { tasbeehId_date: { tasbeehId, date } }
        });

        if (existing) {
            await prisma.tasbeehLog.update({
                where: { id: existing.id },
                data: { count }
            });
        } else {
            await prisma.tasbeehLog.create({
                data: { tasbeehId, count, date }
            });
        }
    } catch (error) {
        console.error("Error updating tasbeeh count:", error);
    }
}

export async function updateTasbeehDetails(id: string, name: string, target: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.tasbeeh.update({
            where: { id, userId: session.user.id },
            data: { name, target }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating tasbeeh details:", error);
        return { error: "Failed to update" };
    }
}

export async function deleteTasbeeh(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.tasbeeh.delete({ where: { id, userId: session.user.id } });
        return { success: true };
    } catch (error) {
        console.error("Error deleting tasbeeh:", error);
        return { error: "Failed to delete" };
    }
}

// --- PLANNER ACTIONS ---

export async function selectPlan(plan: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.user.update({
            where: { id: session.user.id },
            data: { selectedPlan: plan }
        });

        // Delete old tasks to ensure fresh start for new plan
        // This is crucial to avoid mixing "Independent" tasks with "Beginner" tasks
        await prisma.plannerTask.deleteMany({ where: { userId: session.user.id } });

        // Re-seed based on new plan
        await ensureDefaultData(session.user.id, plan);

        return { success: true };
    } catch (error) {
        console.error("Error selecting plan:", error);
        return { error: "Failed to select plan" };
    }
}

export async function getUserPlan() {
    try {
        const session = await auth();
        if (!session?.user?.id) return null;
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { selectedPlan: true } });
        return user?.selectedPlan || "INDEPENDENT";
    } catch (error) {
        console.error("Error fetching user plan:", error);
        return "INDEPENDENT";
    }
}

export async function getPlannerSetup(date: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { tasks: [], plan: 'INDEPENDENT' };

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { selectedPlan: true }
        });
        const plan = user?.selectedPlan || 'INDEPENDENT';

        await ensureDefaultData(session.user.id, plan);

        const tasks = await prisma.plannerTask.findMany({
            where: { userId: session.user.id },
            include: {
                logs: { where: { date } }
            },
            orderBy: { createdAt: 'asc' }
        });

        return {
            plan,
            tasks: tasks.map(t => ({
                ...t,
                completed: t.logs[0]?.completed || false
            }))
        };
    } catch (error) {
        console.error("Error getting planner setup:", error);
        return { tasks: [], plan: 'INDEPENDENT' };
    }
}

export async function addPlannerTask(name: string, category: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.plannerTask.create({
            data: { userId: session.user.id, name, category, isSystem: false }
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding planner task:", e);
        return { error: "Failed" };
    }
}

export async function deletePlannerTask(taskId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.plannerTask.delete({
            where: { id: taskId, userId: session.user.id }
        });
        return { success: true };
    } catch (error) {
        console.error("Error deleting planner task:", error);
        return { error: "Failed" };
    }
}

export async function togglePlannerTask(taskId: string, completed: boolean, date: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return;

        const existing = await prisma.plannerLog.findUnique({
            where: { userId_taskId_date: { userId: session.user.id, taskId, date } }
        });

        if (existing) {
            await prisma.plannerLog.update({
                where: { id: existing.id },
                data: { completed }
            });
        } else {
            await prisma.plannerLog.create({
                data: { userId: session.user.id, taskId, date, completed }
            });
        }
    } catch (error) {
        console.error("Error toggling planner task:", error);
    }
}

export async function getMonthProgress() {
    try {
        const session = await auth();
        if (!session?.user?.id) return {};

        // Get all logs for this user
        const logs = await prisma.plannerLog.findMany({
            where: { userId: session.user.id }
        });

        // Group by date
        const currentTasksCount = await prisma.plannerTask.count({
            where: { userId: session.user.id }
        });

        const progress: Record<string, { completed: number, total: number }> = {};

        logs.forEach(log => {
            if (!progress[log.date]) {
                progress[log.date] = { completed: 0, total: currentTasksCount };
            }
            if (log.completed) {
                progress[log.date].completed++;
            }
        });

        return progress;
    } catch (error) {
        console.error("Error getting month progress:", error);
        return {};
    }
}

export async function resetTasbeehs() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.tasbeeh.deleteMany({ where: { userId: session.user.id } });
        await ensureDefaultData(session.user.id);
        return { success: true };
    } catch (error) {
        console.error("Error resetting tasbeehs:", error);
        return { error: "Failed to reset" };
    }
}

export async function resetPlanner() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        await prisma.plannerTask.deleteMany({ where: { userId: session.user.id } });
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { selectedPlan: true } });
        await ensureDefaultData(session.user.id, user?.selectedPlan || 'INDEPENDENT');

        return { success: true };
    } catch (error) {
        console.error("Error resetting planner:", error);
        return { error: "Failed to reset planner" };
    }
}

export async function handleInvalidSession() {
    await signOut({ redirectTo: '/login' });
}

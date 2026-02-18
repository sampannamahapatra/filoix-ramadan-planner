const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting Debug Script...");

    // 1. Get or Create User
    let user = await prisma.user.findFirst({ where: { email: 'debug@example.com' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Debug User',
                email: 'debug@example.com',
                password: 'password123',
                selectedPlan: 'INDEPENDENT'
            }
        });
        console.log("Created Debug User:", user.id);
    } else {
        console.log("Found Debug User:", user.id);
    }

    const userId = user.id;

    // 2. Simulate 'selectPlan(BEGINNER)'
    console.log("Selecting Plan: BEGINNER...");

    //   a. Update User
    await prisma.user.update({
        where: { id: userId },
        data: { selectedPlan: 'BEGINNER' }
    });

    //   b. Delete Tasks
    const deleted = await prisma.plannerTask.deleteMany({ where: { userId } });
    console.log("Deleted old tasks:", deleted.count);

    //   c. Run Seeding Logic (Copy from actions.ts)
    const plan = 'BEGINNER';
    const requiredTasks = [];

    // Core Tasks
    if (plan === 'BEGINNER' || plan === 'ADVANCED') {
        const core = [
            { name: "Pray Fajr", category: "Obligatory", isSystem: true },
            { name: "Pray Dhuhr", category: "Obligatory", isSystem: true },
            { name: "Pray Asr", category: "Obligatory", isSystem: true },
            { name: "Pray Maghrib", category: "Obligatory", isSystem: true },
            { name: "Pray Isha", category: "Obligatory", isSystem: true },
            { name: "Taraweeh", category: "Spiritual", isSystem: true },
        ];
        requiredTasks.push(...core);
    }

    // Specifics
    if (plan === 'BEGINNER') {
        requiredTasks.push({ name: "Daily Quran Target", category: "Spiritual", isSystem: true });
        requiredTasks.push({ name: "Give Sadaqah", category: "GoodDeeds", isSystem: false });
    }

    console.log("Required Tasks to Seed:", requiredTasks.length);

    for (const task of requiredTasks) {
        const exists = await prisma.plannerTask.findFirst({
            where: { userId, name: task.name }
        });

        if (!exists) {
            await prisma.plannerTask.create({
                data: { ...task, userId }
            });
            console.log(`Created: ${task.name}`);
        } else {
            console.log(`Skipped (Exists): ${task.name}`);
        }
    }

    // 3. Verify Result
    const finalTasks = await prisma.plannerTask.findMany({ where: { userId } });
    console.log("Final Task Count:", finalTasks.length);
    console.log("Tasks:", finalTasks.map(t => t.name));

    if (finalTasks.length > 0) {
        console.log("SUCCESS: Seeding worked.");
    } else {
        console.log("FAILURE: No tasks found.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'password123';
    const name = 'Admin User';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN',
            },
        });
        console.log(`Created user: ${user.email}`);
    } catch (e) {
        if (e.code === 'P2002') {
            console.log('User already exists, updating password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log(`Updated user: ${email}`);
        } else {
            console.error(e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();

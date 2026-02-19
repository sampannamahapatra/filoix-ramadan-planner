const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'musfiqurrahmantuhin@gmail.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN'
            },
            create: {
                email,
                name: 'Musfiqur Rahman Tuhin',
                password: hashedPassword,
                role: 'ADMIN',
                districtId: '1' // Default to Dhaka
            }
        });
        console.log(`Successfully updated user: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`New Password: ${password}`);
    } catch (error) {
        console.error('Error updating user:', error);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

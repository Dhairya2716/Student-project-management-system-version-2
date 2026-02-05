
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
    console.log('Testing Prisma Connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('Connecting...');
        const userCount = await prisma.staff.count();
        console.log('Total staff count:', userCount);

        const email = 'faculty@spms.com';
        console.log(`Fetching user with email: ${email}`);
        const user = await prisma.staff.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                description: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        });

        if (user) {
            console.log('User found:', {
                id: user.id,
                name: user.name,
                role: user.role,
                department: user.department
            });
        } else {
            console.error('User NOT found!');
        }

    } catch (error) {
        console.error('Prisma Error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();

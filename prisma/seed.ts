import { PrismaClient } from '../generated/prisma/client';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';
// Use require for CJS modules to avoid TS interop headaches
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding ...');

    // 1. Create Department
    const department = await prisma.department.upsert({
        where: { code: 'CE' },
        update: {},
        create: {
            name: 'Computer Engineering',
            code: 'CE',
        },
    });
    console.log('Created department:', department.name);

    // 2. Create Batch
    const batch = await prisma.batch.create({
        data: {
            name: '2022-2026',
            start_year: 2022,
            end_year: 2026,
            is_active: true,
        },
    });
    console.log('Created batch:', batch.name);

    // 3. Create Faculty (Guide)
    const password = await hash('password123', 12);
    const faculty = await prisma.staff.upsert({
        where: { email: 'faculty@test.com' },
        update: {},
        create: {
            name: 'Dr. Faculty Test',
            email: 'faculty@test.com',
            password,
            role: 'FACULTY',
            phone: '1234567890',
            is_verified: true,
            department_id: department.id,
        },
    });
    console.log('Created faculty:', faculty.name);

    // 4. Create Student
    const student = await prisma.student.upsert({
        where: { email: 'student@test.com' },
        update: {},
        create: {
            name: 'Student Test',
            email: 'student@test.com',
            enrollment_no: 'CE001',
            password,
            phone: '0987654321',
            department_id: department.id,
            batch_id: batch.id,
        },
    });
    console.log('Created student:', student.name);

    // 5. Create Project Type
    const projectType = await prisma.project_type.create({
        data: {
            name: 'Final Year Project',
            description: 'Main project for final year students',
        },
    });
    console.log('Created project type:', projectType.name);

    // 6. Create Project Group
    const projectGroup = await prisma.project_group.create({
        data: {
            name: 'Team Alpha',
            title: 'Smart Project Management System',
            area: 'Web Development',
            description: 'A system to manage student projects',
            project_type_id: projectType.id,
            guide_id: faculty.id, // Linking faculty as Guide
        },
    });
    console.log('Created project group:', projectGroup.name);

    // 7. Add Student to Group
    await prisma.project_group_member.create({
        data: {
            group_id: projectGroup.id,
            student_id: student.id,
            is_leader: true,
        },
    });
    console.log('Added student to group');

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

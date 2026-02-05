import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            include: {
                batch: true,
                department: true,
                project_group_member: {
                    include: {
                        project_group: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { enrollment_no, name, email, phone, password, batchId, departmentId } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const student = await prisma.student.create({
            data: {
                // enrollment_no: enrollment_no || null,
                name,
                email,
                phone: phone || null,
                password: hashedPassword,
                // batchId: batchId || null,
                // departmentId: departmentId || null
            }
        });

        return NextResponse.json(student, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        console.error('Error creating student:', error);
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }
}

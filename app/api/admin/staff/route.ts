import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        const staff = await prisma.staff.findMany({
            include: { department: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, password, role, departmentId } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const staff = await prisma.staff.create({
            data: {
                name,
                email,
                phone: phone || null,
                password: hashedPassword,
                role: role || 'FACULTY',
                departmentId: departmentId || null
            }
        });

        return NextResponse.json(staff, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        console.error('Error creating staff:', error);
        return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
    }
}

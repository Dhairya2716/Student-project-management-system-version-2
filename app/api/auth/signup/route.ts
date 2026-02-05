import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingStudent = await prisma.student.findUnique({
            where: { email },
        });

        if (existingStudent) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create student
        const student = await prisma.student.create({
            data: {
                name,
                email,
                phone: phone || null,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            message: 'Registration successful',
            user: {
                id: student.id,
                name: student.name,
                email: student.email,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

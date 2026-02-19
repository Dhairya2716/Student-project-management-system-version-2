import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };

        if (decoded.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const student = await prisma.student.findUnique({
            where: { id: decoded.id },
            include: {
                department: true,
                batch: true
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({
            name: student.name,
            email: student.email,
            phone: student.phone,
            enrollment_no: student.enrollment_no,
            department: student.department?.name,
            batch: student.batch?.name,
            description: student.description,
            cgpa: student.cgpa
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };

        if (decoded.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { phone, description, cgpa } = body;

        // Validation
        if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
            return NextResponse.json({ error: 'Invalid CGPA' }, { status: 400 });
        }

        const updatedStudent = await prisma.student.update({
            where: { id: decoded.id },
            data: {
                phone,
                description,
                cgpa: cgpa ? parseFloat(cgpa) : undefined
            }
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            student: updatedStudent
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

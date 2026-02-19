import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const student = await prisma.student.findUnique({
            where: { id: decoded.id }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // In a real app, you would hash passwords. 
        // Assuming plain text for now as per existing codebase patterns or lack of bcrypt import in context.
        // Checking if password matches
        if (student.password !== currentPassword) {
            return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
        }

        await prisma.student.update({
            where: { id: decoded.id },
            data: {
                password: newPassword
            }
        });

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

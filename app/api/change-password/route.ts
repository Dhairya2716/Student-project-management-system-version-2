import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        const body = await req.json();

        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
        }

        let user;
        if (decoded.role === 'FACULTY' || decoded.role === 'ADMIN') {
            user = await prisma.staff.findUnique({
                where: { id: decoded.id },
                select: { id: true, password: true }
            });
        } else if (decoded.role === 'STUDENT') {
            user = await prisma.student.findUnique({
                where: { id: decoded.id },
                select: { id: true, password: true }
            });
        }

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isPasswordValid = await compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10);

        // Update password
        if (decoded.role === 'FACULTY' || decoded.role === 'ADMIN') {
            await prisma.staff.update({
                where: { id: decoded.id },
                data: {
                    password: hashedPassword,
                    updated_at: new Date()
                }
            });
        } else if (decoded.role === 'STUDENT') {
            await prisma.student.update({
                where: { id: decoded.id },
                data: {
                    password: hashedPassword,
                    updated_at: new Date()
                }
            });
        }

        return NextResponse.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

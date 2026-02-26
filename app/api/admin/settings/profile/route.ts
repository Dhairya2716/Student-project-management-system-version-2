import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, signToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email } = await request.json();

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Check if email is already taken by another staff/admin
        const existingUser = await prisma.staff.findFirst({
            where: {
                email,
                id: { not: user.id }
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already taken by another user' },
                { status: 400 }
            );
        }

        const updatedAdmin = await prisma.staff.update({
            where: { id: user.id },
            data: { name, email }
        });

        // Generate a new token with updated details
        const updatedUserPayload = {
            id: updatedAdmin.id,
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            role: updatedAdmin.role as 'ADMIN' | 'FACULTY',
        };

        const newToken = signToken(updatedUserPayload);

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUserPayload,
            token: newToken
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

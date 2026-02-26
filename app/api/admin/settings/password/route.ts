import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { verifyPassword, hashPassword } from '@/lib/auth'; // Ensure hashPassword is exported from lib/auth

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Fetch the admin user
        const admin = await prisma.staff.findUnique({
            where: { id: user.id }
        });

        if (!admin) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isPasswordCorrect = await verifyPassword(currentPassword, admin.password);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                { error: 'Incorrect current password' },
                { status: 400 }
            );
        }

        // Hash and update new password
        const hashedNewPassword = await hashPassword(newPassword);

        await prisma.staff.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Password update error:', error);
        return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
        );
    }
}

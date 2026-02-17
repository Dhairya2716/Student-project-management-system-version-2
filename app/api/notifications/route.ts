import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - Fetch notifications for current user
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unread') === 'true';

        // Build where clause
        const where: any = {
            user_id: decoded.id,
            user_role: decoded.role
        };

        if (unreadOnly) {
            where.is_read = false;
        }

        // Fetch notifications
        const notifications = await prisma.notification.findMany({
            where,
            orderBy: {
                created_at: 'desc'
            },
            take: limit
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                user_id: decoded.id,
                user_role: decoded.role,
                is_read: false
            }
        });

        return NextResponse.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

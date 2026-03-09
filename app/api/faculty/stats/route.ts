import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const facultyId = decoded.id;
        const now = new Date();

        const [totalGroups, scheduledMeetings, pendingSubmissions] = await Promise.all([
            // Total assigned groups (as guide, convener, or expert)
            prisma.project_group.count({
                where: {
                    OR: [
                        { guide_id: facultyId },
                        { convener_id: facultyId },
                        { expert_id: facultyId }
                    ]
                }
            }),
            // Upcoming scheduled meetings created by this faculty
            prisma.project_meeting.count({
                where: {
                    guide_id: facultyId,
                    status: 'SCHEDULED',
                    meeting_datetime: { gte: now }
                }
            }),
            // Pending submissions across all groups assigned to this faculty
            prisma.project_submission.count({
                where: {
                    status: 'PENDING',
                    project_group: {
                        OR: [
                            { guide_id: facultyId },
                            { convener_id: facultyId },
                            { expert_id: facultyId }
                        ]
                    }
                }
            })
        ]);

        return NextResponse.json({
            totalGroups,
            scheduledMeetings,
            pendingSubmissions,
            completedGroups: 0   // Can be wired to a real status once schema has COMPLETED status
        });
    } catch (error) {
        console.error('Error fetching faculty stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

        // Find student's group
        const groupMembership = await prisma.project_group_member.findFirst({
            where: { student_id: decoded.id },
            select: { group_id: true }
        });

        if (!groupMembership) {
            return NextResponse.json([]);
        }

        // Fetch all meetings for the student's group
        const meetings = await prisma.project_meeting.findMany({
            where: {
                group_id: groupMembership.group_id
            },
            include: {
                staff: {
                    select: { id: true, name: true, email: true }
                },
                project_group: {
                    select: { id: true, name: true, title: true }
                },
                project_meeting_attendance: {
                    where: {
                        student_id: decoded.id
                    },
                    select: {
                        is_present: true,
                        remarks: true
                    }
                }
            },
            orderBy: {
                meeting_datetime: 'desc'
            }
        });

        // Transform to include attendance status
        const meetingsWithAttendance = meetings.map(meeting => ({
            ...meeting,
            myAttendance: meeting.project_meeting_attendance[0] || null
        }));

        return NextResponse.json(meetingsWithAttendance);
    } catch (error) {
        console.error('Error fetching student meetings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

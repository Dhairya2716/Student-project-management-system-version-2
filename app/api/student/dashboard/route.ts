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

        // Fetch student details
        const student = await prisma.student.findUnique({
            where: { id: decoded.id },
            include: {
                department: true,
                batch: true,
                project_group_member: {
                    include: {
                        project_group: {
                            include: {
                                project_meeting: {
                                    where: {
                                        meeting_datetime: {
                                            gte: new Date()
                                        },
                                        status: 'SCHEDULED'
                                    },
                                    orderBy: {
                                        meeting_datetime: 'asc'
                                    },
                                    take: 5
                                }
                            }
                        }
                    }
                },
                project_meeting_attendance: {
                    select: {
                        is_present: true,
                        meeting_id: true
                    }
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Calculate stats
        const groupMembership = student.project_group_member[0];
        const hasGroup = !!groupMembership;

        const totalMeetings = hasGroup
            ? await prisma.project_meeting.count({
                where: { group_id: groupMembership.group_id }
            })
            : 0;

        const attendedMeetings = student.project_meeting_attendance.filter(
            a => a.is_present
        ).length;

        const upcomingMeetings = hasGroup
            ? groupMembership.project_group?.project_meeting.length
            : 0;

        const stats = {
            hasGroup,
            groupName: hasGroup ? groupMembership.project_group?.name : null,
            totalMeetings,
            attendedMeetings,
            upcomingMeetings,
            attendancePercentage: totalMeetings > 0
                ? Math.round((attendedMeetings / totalMeetings) * 100)
                : 0,
            isLeader: hasGroup ? groupMembership.is_leader : false,
            cgpa: groupMembership?.cgpa || null
        };

        return NextResponse.json({
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone,
                enrollment_no: student.enrollment_no,
                department: student.department,
                batch: student.batch
            },
            stats
        });
    } catch (error) {
        console.error('Error fetching student dashboard:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

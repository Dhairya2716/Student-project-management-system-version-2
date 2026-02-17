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

        // Find the student's group membership
        const groupMembership = await prisma.project_group_member.findFirst({
            where: {
                student_id: decoded.id
            },
            include: {
                project_group: {
                    include: {
                        project_type: true,
                        staff_project_group_guide_idTostaff: {
                            select: { id: true, name: true, email: true, phone: true }
                        },
                        staff_project_group_convener_idTostaff: {
                            select: { id: true, name: true, email: true, phone: true }
                        },
                        staff_project_group_expert_idTostaff: {
                            select: { id: true, name: true, email: true, phone: true }
                        },
                        project_group_member: {
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        phone: true,
                                        enrollment_no: true,
                                        department: {
                                            select: { name: true, code: true }
                                        },
                                        batch: {
                                            select: { name: true }
                                        }
                                    }
                                }
                            },
                            orderBy: {
                                is_leader: 'desc'
                            }
                        },
                        project_meeting: {
                            select: {
                                id: true,
                                meeting_datetime: true,
                                purpose: true,
                                location: true,
                                status: true,
                                notes: true
                            },
                            orderBy: {
                                meeting_datetime: 'desc'
                            }
                        }
                    }
                }
            }
        });

        if (!groupMembership) {
            return NextResponse.json({ error: 'Not assigned to any group' }, { status: 404 });
        }

        const group = groupMembership.project_group;

        // Add computed fields
        const enrichedGroup = {
            ...group,
            memberCount: group?.project_group_member.length,
            meetingCount: group?.project_meeting.length,
            upcomingMeetings: group?.project_meeting.filter(m =>
                m.status === 'SCHEDULED' && new Date(m.meeting_datetime) > new Date()
            ).length,
            isLeader: groupMembership.is_leader,
            myCgpa: groupMembership.cgpa
        };

        return NextResponse.json(enrichedGroup);
    } catch (error) {
        console.error('Error fetching student group:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

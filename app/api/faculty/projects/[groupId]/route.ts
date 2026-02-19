
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET: Fetch details of a specific project group (Faculty view)
export async function GET(
    req: NextRequest,
    props: { params: Promise<{ groupId: string }> }
) {
    const params = await props.params;
    console.log('Fetching project details for groupId:', params.groupId);
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            console.log('No token provided');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role !== 'FACULTY' && decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const groupId = parseInt(params.groupId);
        if (isNaN(groupId)) {
            return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
        }

        const group = await prisma.project_group.findUnique({
            where: { id: groupId },
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
                        status: true
                    }
                }
            }
        });

        if (!group) {
            return NextResponse.json({ error: 'Project group not found' }, { status: 404 });
        }

        // Add computed fields
        const enrichedGroup = {
            ...group,
            memberCount: group.project_group_member.length,
            meetingCount: group.project_meeting.length,
            upcomingMeetings: group.project_meeting.filter(m =>
                m.status === 'SCHEDULED' && new Date(m.meeting_datetime) > new Date()
            ).length,
        };

        return NextResponse.json(enrichedGroup);

    } catch (error) {
        console.error('Error fetching project details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

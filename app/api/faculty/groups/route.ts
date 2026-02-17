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

        if (decoded.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all groups where faculty is guide, convener, or expert
        const groups = await prisma.project_group.findMany({
            where: {
                OR: [
                    { guide_id: decoded.id },
                    { convener_id: decoded.id },
                    { expert_id: decoded.id }
                ]
            },
            include: {
                project_type: true,
                staff_project_group_guide_idTostaff: {
                    select: { id: true, name: true, email: true }
                },
                staff_project_group_convener_idTostaff: {
                    select: { id: true, name: true, email: true }
                },
                staff_project_group_expert_idTostaff: {
                    select: { id: true, name: true, email: true }
                },
                project_group_member: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                enrollment_no: true,
                                department: {
                                    select: { name: true, code: true }
                                }
                            }
                        }
                    }
                },
                project_meeting: {
                    select: {
                        id: true,
                        meeting_datetime: true,
                        status: true
                    },
                    orderBy: {
                        meeting_datetime: 'desc'
                    }
                }
            },
            orderBy: {
                updated_at: 'desc'
            }
        });

        // Transform data to include role information
        const groupsWithRole = groups.map(group => {
            let role = '';
            if (group.guide_id === decoded.id) role = 'Guide';
            else if (group.convener_id === decoded.id) role = 'Convener';
            else if (group.expert_id === decoded.id) role = 'Expert';

            return {
                ...group,
                facultyRole: role,
                memberCount: group.project_group_member.length,
                meetingCount: group.project_meeting.length,
                upcomingMeetings: group.project_meeting.filter(m =>
                    m.status === 'SCHEDULED' && new Date(m.meeting_datetime) > new Date()
                ).length
            };
        });

        return NextResponse.json(groupsWithRole);
    } catch (error) {
        console.error('Error fetching groups:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

        const projects = await prisma.project_group.findMany({
            where: {
                OR: [
                    { guide_id: decoded.id },
                    { convener_id: decoded.id },
                    { expert_id: decoded.id }
                ]
            },
            include: {
                project_type: true,
                project_group_member: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                enrollment_no: true,
                                email: true,
                                department: {
                                    select: { name: true, code: true }
                                },
                                batch: {
                                    select: { name: true, start_year: true, end_year: true }
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
                    }
                },
                staff_project_group_guide_idTostaff: {
                    select: { id: true, name: true }
                },
                staff_project_group_convener_idTostaff: {
                    select: { id: true, name: true }
                },
                staff_project_group_expert_idTostaff: {
                    select: { id: true, name: true }
                }
            },
            orderBy: {
                updated_at: 'desc'
            }
        });

        // Add computed fields
        const projectsWithStats = projects.map(project => {
            const completedMeetings = project.project_meeting.filter(m => m.status === 'COMPLETED').length;
            const totalMeetings = project.project_meeting.length;
            const progress = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;

            return {
                ...project,
                memberCount: project.project_group_member.length,
                completedMeetings,
                totalMeetings,
                progress: Math.round(progress)
            };
        });

        return NextResponse.json(projectsWithStats);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

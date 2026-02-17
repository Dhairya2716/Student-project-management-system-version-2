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

        const meetings = await prisma.project_meeting.findMany({
            where: {
                guide_id: decoded.id
            },
            include: {
                project_group: {
                    include: {
                        project_group_member: {
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        enrollment_no: true
                                    }
                                }
                            }
                        }
                    }
                },
                project_meeting_attendance: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                enrollment_no: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                meeting_datetime: 'desc'
            }
        });

        return NextResponse.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };

        if (decoded.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { group_id, meeting_datetime, duration, purpose, location, meeting_link, agenda, notes } = body;

        if (!group_id || !meeting_datetime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify faculty is guide of this group
        const group = await prisma.project_group.findFirst({
            where: {
                id: parseInt(group_id),
                guide_id: decoded.id
            }
        });

        if (!group) {
            return NextResponse.json({ error: 'Not authorized for this group' }, { status: 403 });
        }

        const meeting = await prisma.project_meeting.create({
            data: {
                project_group: {
                    connect: { id: parseInt(group_id) }
                },
                staff: {
                    connect: { id: decoded.id }
                },
                meeting_datetime: new Date(meeting_datetime),
                duration: duration ? parseInt(duration) : null,
                purpose,
                location,
                meeting_link,
                agenda,
                notes,
                status: 'SCHEDULED'
            },
            include: {
                project_group: {
                    select: {
                        name: true,
                        title: true
                    }
                }
            }
        });

        return NextResponse.json(meeting, { status: 201 });
    } catch (error: any) {
        console.error('Error creating meeting:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

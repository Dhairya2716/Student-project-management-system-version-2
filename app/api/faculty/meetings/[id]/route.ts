import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const meetingId = parseInt(id);
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };

        if (decoded.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { meeting_datetime, purpose, location, notes, status } = body;

        // Verify faculty owns this meeting
        const existingMeeting = await prisma.project_meeting.findFirst({
            where: {
                id: meetingId,
                guide_id: decoded.id
            }
        });

        if (!existingMeeting) {
            return NextResponse.json({ error: 'Meeting not found or unauthorized' }, { status: 404 });
        }

        const meeting = await prisma.$transaction(async (tx) => {
            // Update meeting details
            const updatedMeeting = await tx.project_meeting.update({
                where: { id: meetingId },
                data: {
                    ...(meeting_datetime && { meeting_datetime: new Date(meeting_datetime) }),
                    ...(purpose && { purpose }),
                    ...(location && { location }),
                    ...(notes && { notes }),
                    ...(status && { status })
                },
                include: {
                    project_group: {
                        select: {
                            name: true,
                            title: true,
                            project_group_member: {
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
                        }
                    },
                    project_meeting_attendance: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            // Update attendance if provided
            if (body.attendance && Array.isArray(body.attendance)) {
                for (const record of body.attendance) {
                    await tx.project_meeting_attendance.upsert({
                        where: {
                            meeting_id_student_id: {
                                meeting_id: meetingId,
                                student_id: record.student_id
                            }
                        },
                        create: {
                            meeting_id: meetingId,
                            student_id: record.student_id,
                            is_present: record.is_present,
                            remarks: record.remarks
                        },
                        update: {
                            is_present: record.is_present,
                            remarks: record.remarks
                        }
                    });
                }
            }

            return updatedMeeting;
        });

        return NextResponse.json(meeting);
    } catch (error) {
        console.error('Error updating meeting:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const meetingId = parseInt(id);
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };

        if (decoded.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Verify faculty owns this meeting
        const existingMeeting = await prisma.project_meeting.findFirst({
            where: {
                id: meetingId,
                guide_id: decoded.id
            }
        });

        if (!existingMeeting) {
            return NextResponse.json({ error: 'Meeting not found or unauthorized' }, { status: 404 });
        }

        await prisma.project_meeting.delete({
            where: { id: meetingId }
        });

        return NextResponse.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

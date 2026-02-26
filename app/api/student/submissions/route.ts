
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET: Fetch submissions for the logged-in student's group
export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Find the student's group
        const groupMember = await prisma.project_group_member.findFirst({
            where: { student_id: decoded.id },
            select: { group_id: true }
        });

        if (!groupMember || !groupMember.group_id) {
            return NextResponse.json({ error: 'Not in a group' }, { status: 404 });
        }

        const submissions = await prisma.project_submission.findMany({
            where: { group_id: groupMember.group_id },
            include: {
                student: {
                    select: { name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(submissions);

    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new submission
export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Find the student's group
        const groupMember = await prisma.project_group_member.findFirst({
            where: { student_id: decoded.id },
            select: { group_id: true }
        });

        if (!groupMember || !groupMember.group_id) {
            return NextResponse.json({ error: 'Not in a group' }, { status: 404 });
        }

        const body = await req.json();
        const { title, description, link, fileUrl, submission_type } = body;

        if (!title || (!link && !fileUrl)) {
            return NextResponse.json({ error: 'Title and either a Link or File are required' }, { status: 400 });
        }

        const newSubmission = await prisma.project_submission.create({
            data: {
                group_id: groupMember.group_id,
                student_id: decoded.id,
                title,
                description,
                link: link || null,
                fileUrl: fileUrl || null,
                submission_type: submission_type || 'LINK',
                status: 'PENDING'
            }
        });

        return NextResponse.json(newSubmission, { status: 201 });

    } catch (error) {
        console.error('Error creating submission:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

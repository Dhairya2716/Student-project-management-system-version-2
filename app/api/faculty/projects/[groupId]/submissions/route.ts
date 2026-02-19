
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET: Fetch submissions for a specific group (Faculty view)
export async function GET(
    req: NextRequest,
    props: { params: Promise<{ groupId: string }> }
) {
    const params = await props.params;
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role !== 'FACULTY' && decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const groupId = parseInt(params.groupId);
        if (isNaN(groupId)) {
            return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
        }

        // Technically we should check if this faculty is associated with the group
        // But for now, let's allow any faculty to view any project's submissions (or unrestricted within faculty department)
        // For strictness, you could check if faculty is guide/convener/expert, or admin.

        const submissions = await prisma.project_submission.findMany({
            where: { group_id: groupId },
            include: {
                student: {
                    select: { name: true, enrollment_no: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(submissions);

    } catch (error) {
        console.error('Error fetching group submissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

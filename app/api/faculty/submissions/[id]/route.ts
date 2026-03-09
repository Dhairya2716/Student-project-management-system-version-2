import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// PATCH: Approve or Reject a submission
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const submissionId = parseInt(params.id);
        const { status } = await req.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        // Verify this submission belongs to one of the faculty's groups
        const submission = await prisma.project_submission.findUnique({
            where: { id: submissionId },
            include: {
                project_group: {
                    select: { guide_id: true, convener_id: true, expert_id: true }
                }
            }
        });

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        const pg = submission.project_group;
        const hasAccess = pg?.guide_id === decoded.id ||
            pg?.convener_id === decoded.id ||
            pg?.expert_id === decoded.id;

        if (!hasAccess) {
            return NextResponse.json({ error: 'You do not have access to this submission' }, { status: 403 });
        }

        const updated = await prisma.project_submission.update({
            where: { id: submissionId },
            data: { status }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating submission status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

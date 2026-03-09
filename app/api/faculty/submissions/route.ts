import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET: All submissions across groups assigned to this faculty
export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const submissions = await prisma.project_submission.findMany({
            where: {
                project_group: {
                    OR: [
                        { guide_id: decoded.id },
                        { convener_id: decoded.id },
                        { expert_id: decoded.id }
                    ]
                }
            },
            include: {
                student: { select: { id: true, name: true } },
                project_group: { select: { id: true, name: true, title: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Error fetching faculty submissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

        // Fetch the current student's department and batch
        const currentStudent = await prisma.student.findUnique({
            where: { id: decoded.id },
            select: {
                department_id: true,
                batch_id: true
            }
        });

        // Build the filter — match same dept+batch if available, otherwise show ALL unassigned students
        const baseFilter: Record<string, unknown> = {
            id: { not: decoded.id }, // Exclude self
            project_group_member: { none: {} } // Not in any group
        };

        if (currentStudent?.department_id) {
            baseFilter.department_id = currentStudent.department_id;
        }
        if (currentStudent?.batch_id) {
            baseFilter.batch_id = currentStudent.batch_id;
        }

        const availableStudents = await prisma.student.findMany({
            where: baseFilter,
            select: {
                id: true,
                name: true,
                enrollment_no: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(availableStudents);
    } catch (error) {
        console.error('Error fetching available students:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

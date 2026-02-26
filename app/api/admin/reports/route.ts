import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Aggregate Statistics
        const [
            totalStudents,
            totalStaff,
            totalProjects,
            totalDepartments,
            totalBatches,
            projectStatusCounts,
            studentDeptCounts
        ] = await Promise.all([
            prisma.student.count(),
            prisma.staff.count(),
            prisma.project_group.count(),
            prisma.department.count(),
            prisma.batch.count(),
            // Group projects by status
            prisma.project_group.groupBy({
                by: ['status'],
                _count: {
                    _all: true
                }
            }),
            // Count students per department
            prisma.student.groupBy({
                by: ['department_id'],
                _count: {
                    _all: true
                }
            })
        ]);

        // Get department names for the student dept counts
        const departments = await prisma.department.findMany({
            select: { id: true, name: true, code: true }
        });

        const studentsByDepartment = studentDeptCounts.map(count => {
            const dept = departments.find(d => d.id === count.department_id);
            return {
                department: dept ? dept.code : 'Unknown',
                count: count._count._all
            };
        });

        const projectsByStatus = projectStatusCounts.reduce((acc: Record<string, number>, curr) => {
            const status = curr.status || 'PENDING';
            acc[status] = curr._count._all;
            return acc;
        }, { PENDING: 0, APPROVED: 0, REJECTED: 0 });

        return NextResponse.json({
            overview: {
                totalStudents,
                totalStaff,
                totalProjects,
                totalDepartments,
                totalBatches,
            },
            projectsByStatus,
            studentsByDepartment
        });
    } catch (error) {
        console.error('Error fetching reports data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports data' },
            { status: 500 }
        );
    }
}

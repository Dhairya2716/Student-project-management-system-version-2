import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const type = request.nextUrl.searchParams.get('type');

        if (!type || !['students', 'staff', 'projects'].includes(type)) {
            return NextResponse.json({ error: 'Invalid export type. Must be students, staff, or projects.' }, { status: 400 });
        }

        let csvString = '';
        let filename = '';

        if (type === 'students') {
            const students = await prisma.student.findMany({
                include: { department: true, batch: true }
            });

            filename = 'students_export.csv';
            csvString = 'ID,Enrollment No,Name,Email,Phone,Department,Batch,CGPA\n';
            students.forEach(s => {
                csvString += `${s.id},${s.enrollment_no || ''},"${s.name}","${s.email}",${s.phone || ''},"${s.department?.name || ''}","${s.batch?.name || ''}",${s.cgpa || ''}\n`;
            });
        }
        else if (type === 'staff') {
            const staff = await prisma.staff.findMany({
                include: { department: true }
            });

            filename = 'staff_export.csv';
            csvString = 'ID,Name,Email,Phone,Role,Department\n';
            staff.forEach(s => {
                csvString += `${s.id},"${s.name}","${s.email}",${s.phone || ''},${s.role},"${s.department?.name || ''}"\n`;
            });
        }
        else if (type === 'projects') {
            const projects = await prisma.project_group.findMany({
                include: { project_type: true }
            });

            filename = 'projects_export.csv';
            csvString = 'ID,Group Name,Project Title,Area,Status,Type,Average CPI\n';
            projects.forEach(p => {
                csvString += `${p.id},"${p.name}","${p.title}","${p.area || ''}",${p.status},"${p.project_type?.name || ''}",${p.average_cpi || ''}\n`;
            });
        }

        return new NextResponse(csvString, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Error exporting data:', error);
        return NextResponse.json(
            { error: 'Failed to export data' },
            { status: 500 }
        );
    }
}

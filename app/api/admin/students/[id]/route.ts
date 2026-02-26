import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { enrollment_no, name, email, phone, batchId, departmentId } = await request.json();

        const student = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
                enrollment_no: enrollment_no || null,
                name,
                email,
                phone: phone || null,
                batch_id: batchId || null,
                department_id: departmentId || null
            }
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.student.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Student deleted' });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }
}

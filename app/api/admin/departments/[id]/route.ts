import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { name, code } = await request.json();

        const department = await prisma.department.update({
            where: { id: parseInt(id) },
            data: { name, code }
        });

        return NextResponse.json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.department.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Department deleted' });
    } catch (error) {
        console.error('Error deleting department:', error);
        return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
    }
}

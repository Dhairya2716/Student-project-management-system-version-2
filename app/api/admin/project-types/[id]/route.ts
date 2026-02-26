import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid project type ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, description } = body;

        const updatedType = await prisma.project_type.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description })
            }
        });

        return NextResponse.json(updatedType);
    } catch (error) {
        console.error('Error updating project type:', error);
        return NextResponse.json({ error: 'Failed to update project type' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid project type ID' }, { status: 400 });
        }

        await prisma.project_type.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project type:', error);
        return NextResponse.json({ error: 'Failed to delete project type' }, { status: 500 });
    }
}

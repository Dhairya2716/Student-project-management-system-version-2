import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { name, start_year, end_year } = await request.json();

        const batch = await prisma.batch.update({
            where: { id: parseInt(id) },
            data: { name, start_year, end_year }
        });

        return NextResponse.json(batch);
    } catch (error) {
        console.error('Error updating batch:', error);
        return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.batch.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Batch deleted' });
    } catch (error) {
        console.error('Error deleting batch:', error);
        return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
    }
}

// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // assuming next-auth might be used, or decode token

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid project group ID' }, { status: 400 });
        }

        const body = await request.json();
        const { guide_id, status } = body;

        // Perform the update
        const updatedGroup = await prisma.project_group.update({
            where: { id },
            data: {
                ...(guide_id !== undefined && { guide_id: guide_id === null ? null : parseInt(guide_id) }),
                ...(status !== undefined && { status })
            }
        });

        return NextResponse.json(updatedGroup);

    } catch (error) {
        console.error('Error updating project group:', error);
        return NextResponse.json({ error: 'Failed to update project group' }, { status: 500 });
    }
}

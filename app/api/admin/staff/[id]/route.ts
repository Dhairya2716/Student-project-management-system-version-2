import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { name, email, phone, role, department_id } = await request.json();

        const staff = await prisma.staff.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email,
                phone: phone || null,
                role,
                department_id: department_id || null
            }
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.error('Error updating staff:', error);
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.staff.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Staff deleted' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
    }
}

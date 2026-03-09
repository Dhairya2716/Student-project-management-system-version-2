import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper: recalculate and update average_cpi for a group
async function recalculateGroupCpi(groupId: number) {
    const members = await prisma.project_group_member.findMany({
        where: { group_id: groupId },
        include: {
            student: { select: { cgpa: true } }
        }
    });

    const validCgpas = members
        .map(m => m.student?.cgpa)
        .filter((c): c is number => c !== null && c !== undefined);

    const average_cpi = validCgpas.length > 0
        ? validCgpas.reduce((sum, c) => sum + c, 0) / validCgpas.length
        : null;

    await prisma.project_group.update({
        where: { id: groupId },
        data: { average_cpi }
    });

    return average_cpi;
}

// POST: Add a member to the group (leader or faculty guide only)
export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        const { student_id, group_id } = await req.json();

        if (!student_id || !group_id) {
            return NextResponse.json({ error: 'student_id and group_id are required' }, { status: 400 });
        }

        const group = await prisma.project_group.findUnique({
            where: { id: group_id },
            include: { project_group_member: true }
        });

        if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

        // Authorization check
        if (decoded.role === 'STUDENT') {
            const membership = group.project_group_member.find(m => m.student_id === decoded.id);
            if (!membership?.is_leader) {
                return NextResponse.json({ error: 'Only the group leader can add members' }, { status: 403 });
            }
        } else if (decoded.role === 'FACULTY') {
            if (group.guide_id !== decoded.id && group.convener_id !== decoded.id) {
                return NextResponse.json({ error: 'Only the assigned guide or convener can manage members' }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if student is already in any group
        const existingMembership = await prisma.project_group_member.findFirst({
            where: { student_id }
        });

        if (existingMembership) {
            return NextResponse.json({ error: 'This student is already in a group' }, { status: 400 });
        }

        // Get student cgpa
        const student = await prisma.student.findUnique({
            where: { id: student_id },
            select: { cgpa: true }
        });

        // Add the member
        await prisma.project_group_member.create({
            data: {
                group_id,
                student_id,
                is_leader: false,
                cgpa: student?.cgpa || null
            }
        });

        // Recalculate CPI
        const new_cpi = await recalculateGroupCpi(group_id);

        return NextResponse.json({ message: 'Member added successfully', average_cpi: new_cpi }, { status: 201 });
    } catch (error) {
        console.error('Error adding member:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Remove a member from the group (leader or faculty guide only)
export async function DELETE(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        const { searchParams } = new URL(req.url);
        const group_id = Number(searchParams.get('group_id'));
        const student_id = Number(searchParams.get('student_id'));

        if (!student_id || !group_id) {
            return NextResponse.json({ error: 'student_id and group_id are required' }, { status: 400 });
        }

        const group = await prisma.project_group.findUnique({
            where: { id: group_id },
            include: { project_group_member: true }
        });

        if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

        // Authorization check
        if (decoded.role === 'STUDENT') {
            const membership = group.project_group_member.find(m => m.student_id === decoded.id);
            if (!membership?.is_leader) {
                return NextResponse.json({ error: 'Only the group leader can remove members' }, { status: 403 });
            }
        } else if (decoded.role === 'FACULTY') {
            if (group.guide_id !== decoded.id && group.convener_id !== decoded.id) {
                return NextResponse.json({ error: 'Only the assigned guide or convener can manage members' }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Cannot remove the leader
        const targetMembership = group.project_group_member.find(m => m.student_id === student_id);
        if (targetMembership?.is_leader) {
            return NextResponse.json({ error: 'Cannot remove the group leader' }, { status: 400 });
        }

        // Remove the member
        await prisma.project_group_member.deleteMany({
            where: { group_id, student_id }
        });

        // Recalculate CPI
        const new_cpi = await recalculateGroupCpi(group_id);

        return NextResponse.json({ message: 'Member removed successfully', average_cpi: new_cpi });
    } catch (error) {
        console.error('Error removing member:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function decode(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    try {
        return verify(token, JWT_SECRET) as { id: number; role: string };
    } catch {
        return null;
    }
}

// GET /api/messages?groupId=X  – fetch messages for a group
export async function GET(req: NextRequest) {
    const user = decode(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(req.nextUrl.searchParams.get('groupId') || '0');
    if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });

    // Verify the requester has access to this group
    let hasAccess = false;
    if (user.role === 'ADMIN') {
        hasAccess = true;
    } else if (user.role === 'FACULTY') {
        const g = await prisma.project_group.findFirst({
            where: {
                id: groupId,
                OR: [{ guide_id: user.id }, { convener_id: user.id }, { expert_id: user.id }]
            }
        });
        hasAccess = !!g;
    } else if (user.role === 'STUDENT') {
        const m = await prisma.project_group_member.findFirst({
            where: { group_id: groupId, student_id: user.id }
        });
        hasAccess = !!m;
    }

    if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const msgs = await prisma.group_message.findMany({
        where: { group_id: groupId },
        orderBy: { created_at: 'asc' },
        take: 100
    });

    // Resolve sender names
    const enriched = await Promise.all(msgs.map(async (msg) => {
        let senderName = 'Unknown';
        if (msg.sender_role === 'STUDENT') {
            const s = await prisma.student.findUnique({ where: { id: msg.sender_id }, select: { name: true } });
            senderName = s?.name ?? 'Student';
        } else if (msg.sender_role === 'FACULTY') {
            const s = await prisma.staff.findUnique({ where: { id: msg.sender_id }, select: { name: true } });
            senderName = s?.name ?? 'Faculty';
        } else {
            senderName = 'Admin';
        }
        return { ...msg, senderName };
    }));

    return NextResponse.json(enriched);
}

// POST /api/messages – send a message to a group
export async function POST(req: NextRequest) {
    const user = decode(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupId, message } = await req.json();
    if (!groupId || !message?.trim()) {
        return NextResponse.json({ error: 'groupId and message are required' }, { status: 400 });
    }

    // Verify access
    let hasAccess = false;
    if (user.role === 'ADMIN') {
        hasAccess = true;
    } else if (user.role === 'FACULTY') {
        const g = await prisma.project_group.findFirst({
            where: {
                id: parseInt(groupId),
                OR: [{ guide_id: user.id }, { convener_id: user.id }, { expert_id: user.id }]
            }
        });
        hasAccess = !!g;
    } else if (user.role === 'STUDENT') {
        const m = await prisma.project_group_member.findFirst({
            where: { group_id: parseInt(groupId), student_id: user.id }
        });
        hasAccess = !!m;
    }

    if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const created = await prisma.group_message.create({
        data: {
            group_id: parseInt(groupId),
            sender_id: user.id,
            sender_role: user.role as any,
            message: message.trim()
        }
    });

    // Resolve sender name for response
    let senderName = 'Admin';
    if (user.role === 'FACULTY') {
        const s = await prisma.staff.findUnique({ where: { id: user.id }, select: { name: true } });
        senderName = s?.name ?? 'Faculty';
    } else if (user.role === 'STUDENT') {
        const s = await prisma.student.findUnique({ where: { id: user.id }, select: { name: true } });
        senderName = s?.name ?? 'Student';
    }

    return NextResponse.json({ ...created, senderName }, { status: 201 });
}

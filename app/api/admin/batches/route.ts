import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const batches = await prisma.batch.findMany({
            include: {
                _count: { select: { student: true } }
            },
            orderBy: { start_year: 'desc' }
        });
        return NextResponse.json(batches);
    } catch (error) {
        console.error('Error fetching batches:', error);
        return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, start_year, end_year } = await request.json();

        if (!name || !start_year || !end_year) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const batch = await prisma.batch.create({
            data: { name, start_year, end_year }
        });

        return NextResponse.json(batch, { status: 201 });
    } catch (error) {
        console.error('Error creating batch:', error);
        return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
    }
}

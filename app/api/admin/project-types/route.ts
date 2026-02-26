import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
    try {
        const projectTypes = await prisma.project_type.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json(projectTypes);
    } catch (error) {
        console.error('Error fetching project types:', error);
        return NextResponse.json({ error: 'Failed to fetch project types' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const projectType = await prisma.project_type.create({
            data: {
                name,
                description
            }
        });

        return NextResponse.json(projectType, { status: 201 });
    } catch (error) {
        console.error('Error creating project type:', error);
        return NextResponse.json({ error: 'Failed to create project type' }, { status: 500 });
    }
}

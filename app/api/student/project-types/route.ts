import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };

        if (decoded.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch project types
        let projectTypes = await prisma.project_type.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        // Seed default options if none exist
        if (projectTypes.length === 0) {
            const predefined = [
                { name: 'Web Development', description: 'Web-based software applications' },
                { name: 'Mobile App Development', description: 'iOS and Android applications' },
                { name: 'Machine Learning / AI', description: 'AI models and ML algorithms' },
                { name: 'Data Science', description: 'Data analytics and visualization' },
                { name: 'Cybersecurity', description: 'Security tools and analysis' },
                { name: 'Internet of Things (IoT)', description: 'Hardware / software integrations' },
                { name: 'Blockchain / Web3', description: 'Decentralized applications' }
            ];

            await prisma.project_type.createMany({
                data: predefined
            });

            projectTypes = await prisma.project_type.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
        }

        return NextResponse.json(projectTypes);
    } catch (error) {
        console.error('Error fetching project types:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

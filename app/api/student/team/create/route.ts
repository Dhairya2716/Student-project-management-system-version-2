import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };

        if (decoded.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { title, name, description, area, project_type_id, selected_student_ids } = body;

        // Validation
        if (!title || !name || !project_type_id) {
            return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
        }

        // Parse student IDs and include the creator
        const memberIds = Array.isArray(selected_student_ids)
            ? selected_student_ids.map((id: string | number) => Number(id))
            : [];

        // Check if any selected student is already in a group
        const allStudentIds = [decoded.id, ...memberIds];
        const existingMemberships = await prisma.project_group_member.findMany({
            where: {
                student_id: { in: allStudentIds }
            }
        });

        if (existingMemberships.length > 0) {
            return NextResponse.json({
                error: 'One or more students are already assigned to a project group.'
            }, { status: 400 });
        }

        // Fetch students to compute average CGPA
        const students = await prisma.student.findMany({
            where: { id: { in: allStudentIds } }
        });

        const totalCgpa = students.reduce((sum, current) => sum + (current.cgpa || 0), 0);
        const averageCgpa = students.length > 0 ? totalCgpa / students.length : null;

        // Transaction to create Project Group and Members
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Group (PENDING status)
            const newGroup = await tx.project_group.create({
                data: {
                    name,
                    title,
                    description,
                    area,
                    project_type_id: Number(project_type_id),
                    average_cpi: averageCgpa,
                    status: 'PENDING'
                }
            });

            // 2. Add Group Members
            const memberData = allStudentIds.map(studentId => ({
                group_id: newGroup.id,
                student_id: studentId,
                is_leader: studentId === decoded.id, // The creator is the leader
                cgpa: students.find(s => s.id === studentId)?.cgpa || null
            }));

            await tx.project_group_member.createMany({
                data: memberData
            });

            return newGroup;
        });

        return NextResponse.json({
            message: 'Project group created successfully and is pending approval',
            group: result
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating project group:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

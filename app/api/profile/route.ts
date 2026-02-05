export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch user profile
export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            console.log('Profile API: No token provided');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Profile API: Token received');
        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        console.log('Profile API: Decoded token:', { id: decoded.id, role: decoded.role });

        let user;
        if (decoded.role === 'FACULTY' || decoded.role === 'ADMIN') {
            console.log('Profile API: Fetching staff profile for id:', decoded.id);
            user = await prisma.staff.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    description: true,
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    }
                }
            });
        } else if (decoded.role === 'STUDENT') {
            console.log('Profile API: Fetching student profile for id:', decoded.id);
            user = await prisma.student.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    enrollment_no: true,
                    description: true,
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    },
                    batch: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
        }

        if (!user) {
            console.log('Profile API: User not found for id:', decoded.id);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('Profile API: Successfully fetched user profile');
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, JWT_SECRET) as { id: number; role: string };
        const body = await req.json();

        const { name, phone, description } = body;

        let updatedUser;
        if (decoded.role === 'FACULTY' || decoded.role === 'ADMIN') {
            updatedUser = await prisma.staff.update({
                where: { id: decoded.id },
                data: {
                    name,
                    phone,
                    description,
                    updated_at: new Date()
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    description: true
                }
            });
        } else if (decoded.role === 'STUDENT') {
            updatedUser = await prisma.student.update({
                where: { id: decoded.id },
                data: {
                    name,
                    phone,
                    description,
                    updated_at: new Date()
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    enrollment_no: true,
                    description: true
                }
            });
        }

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update localStorage user data
        const userData = {
            ...updatedUser,
            role: decoded.role
        };

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: userData
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

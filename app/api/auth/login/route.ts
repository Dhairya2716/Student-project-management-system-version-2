import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // First, check in staff table (for ADMIN/FACULTY)
        const staff = await prisma.staff.findUnique({
            where: { email },
        });

        if (staff) {
            const isValid = await verifyPassword(password, staff.password);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            const user = {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                role: staff.role as 'ADMIN' | 'FACULTY',
            };

            const token = signToken(user);
            console.log('[Login API] Token generated for user:', user.email, 'Role:', user.role);

            // Determine redirect URL based on role
            const redirectUrl = 
                user.role === 'ADMIN' ? '/dashboard/admin' :
                user.role === 'FACULTY' ? '/dashboard/faculty' :
                                            '/dashboard/student';

            const response = NextResponse.json({
                message: 'Login successful',
                token,
                user,
                redirectUrl
            });

            // Set token as HTTP-only cookie
            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            

            console.log('[Login API] Cookie set, redirectUrl:', redirectUrl);
            return response;
        }

        // If not found in staff, check in student table
        const student = await prisma.student.findUnique({
            where: { email },
        });

        if (student && student.password) {
            const isValid = await verifyPassword(password, student.password);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            const user = {
                id: student.id,
                name: student.name,
                email: student.email,
                role: 'STUDENT' as const,
            };

            const token = signToken(user);

            const response = NextResponse.json({
                message: 'Login successful',
                token,
                user,
                redirectUrl: '/dashboard/student'
            });

            // Set token as HTTP-only cookie
            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            

            return response;
        }

        // User not found in either table
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

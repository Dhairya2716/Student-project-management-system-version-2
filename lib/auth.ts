// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// export async function hashPassword(password: string): Promise<string> {
//     return bcrypt.hash(password, 12);
// }

// export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//     return bcrypt.compare(password, hashedPassword);
// }

// export interface TokenPayload {
//     id: number;
//     email: string;
//     role: 'ADMIN' | 'FACULTY' | 'STUDENT';
//     name: string;
// }

// export function signToken(payload: TokenPayload): string {
//     return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
// }

// export function verifyToken(token: string): TokenPayload | null {
//     try {
//         return jwt.verify(token, JWT_SECRET) as TokenPayload;
//     } catch {
//         return null;
//     }
// }

//
//

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-token-key';

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export interface TokenPayload {
    id: number;
    email: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
    name?: string;
    exp?: number;
}

export const signToken = (user: {
    id: number;
    email: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
    name?: string;
}) => {
    return jwt.sign(
        user,
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export const verifyToken = (token: string) => {

    try {
        return jwt.verify(
            token,
            JWT_SECRET
        ) as TokenPayload;
    }
    catch {
        return null;
    }
}

import { NextRequest } from 'next/server';

export async function verifyAuth(request: NextRequest): Promise<TokenPayload | null> {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) return null;

        return verifyToken(token);
    } catch {
        return null;
    }
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');

        if (!userData) {
            router.push('/login');
            return;
        }

        try {
            const user = JSON.parse(userData);
            const roleRoutes: { [key: string]: string } = {
                ADMIN: '/dashboard/admin',
                FACULTY: '/dashboard/faculty',
                STUDENT: '/dashboard/student',
            };
            router.push(roleRoutes[user.role] || '/login');
        } catch {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 text-center">Redirecting...</p>
            </div>
        </div>
    );
}

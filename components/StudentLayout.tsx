'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    GraduationCap,
    Users,
    Calendar,
    LogOut,
    Home,
    User,
    Settings,
    ChevronRight,
    Search,
    Menu,
    X,
    FolderKanban,
    MessageSquare
} from 'lucide-react';
import NotificationBell from './NotificationBell';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
}

interface StudentLayoutProps {
    children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        try {
            const parsed = JSON.parse(userData);
            if (parsed.role !== 'STUDENT') {
                router.push('/dashboard');
                return;
            }
            setUser(parsed);
        } catch {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12] flex items-center justify-center transition-colors duration-300">
                <div className="relative">
                    <div className="w-14 h-14 border-4 border-emerald-200 dark:border-emerald-500/20 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-b-teal-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const navItems = [
        { icon: Home, label: 'Dashboard', href: '/dashboard/student' },
        { icon: Users, label: 'My Team', href: '/dashboard/student/team' },
        { icon: Calendar, label: 'Meetings', href: '/dashboard/student/meetings' },
        { icon: FolderKanban, label: 'Project', href: '/dashboard/student/project' },
        { icon: MessageSquare, label: 'Messages', href: '/dashboard/student/messages' },
        { icon: User, label: 'Profile', href: '/dashboard/student/profile' },
        { icon: Settings, label: 'Settings', href: '/dashboard/student/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12] flex transition-colors duration-500">
            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-400/[0.07] dark:bg-emerald-500/[0.04] rounded-full blur-[120px] animate-pulse-glow"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-teal-400/[0.07] dark:bg-teal-500/[0.04] rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} relative glass border-r border-gray-200/80 dark:border-white/[0.06] flex flex-col transition-all duration-300 z-40`}>
                {/* Logo */}
                <div className="p-5 border-b border-gray-200/80 dark:border-white/[0.06]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-300">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="animate-slide-in">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">SPMS</span>
                                <span className="block text-[11px] font-medium text-emerald-500 dark:text-emerald-400">Student Portal</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/50 dark:border-emerald-500/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${isActive
                                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20'
                                    : 'group-hover:bg-gray-200/50 dark:group-hover:bg-white/[0.06]'
                                    }`}>
                                    <item.icon className={`w-[18px] h-[18px] transition-all duration-300 ${isActive
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:scale-110'
                                        }`} />
                                </div>
                                {sidebarOpen && (
                                    <>
                                        <span className="font-medium text-sm">{item.label}</span>
                                        <ChevronRight className={`w-4 h-4 ml-auto transition-all duration-300 ${isActive ? 'opacity-70' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Card + Logout */}
                <div className="p-3 border-t border-gray-200/80 dark:border-white/[0.06]">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-white/[0.03] dark:to-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] mb-2 group hover:border-emerald-300/50 dark:hover:border-emerald-500/20 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                                <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-[11px] font-medium text-emerald-500 dark:text-emerald-400">Student</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all duration-300 group">
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-40 glass-header border-b border-gray-200/80 dark:border-white/[0.06] px-6 py-3 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors duration-200" />
                                <input type="text" placeholder="Search..." className="w-56 pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400/50 transition-all duration-300" />
                            </div>
                            <NotificationBell accentColor="emerald" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

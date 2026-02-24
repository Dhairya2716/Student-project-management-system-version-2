'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import UserProfileDropdown from './UserProfileDropdown';
import {
    GraduationCap,
    Users,
    ClipboardList,
    Calendar,
    LogOut,
    Home,
    FolderKanban,
    ChevronRight,
    Bell,
    Search,
    Menu,
    X,
    MessageSquare
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
}

interface FacultyLayoutProps {
    children: ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
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
            if (parsed.role !== 'FACULTY') {
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
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const navItems = [
        { icon: Home, label: 'Dashboard', href: '/dashboard/faculty' },
        { icon: Users, label: 'My Groups', href: '/dashboard/faculty/groups' },
        { icon: Calendar, label: 'Meetings', href: '/dashboard/faculty/meetings' },
        { icon: ClipboardList, label: 'Evaluations', href: '/dashboard/faculty/evaluations' },
        { icon: FolderKanban, label: 'Projects', href: '/dashboard/faculty/projects' },
        { icon: MessageSquare, label: 'Messages', href: '/dashboard/faculty/messages' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex transition-colors duration-300">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px]"></div>
            </div>

            <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} relative bg-white dark:bg-white/[0.02] border-r border-gray-200 dark:border-white/10 flex flex-col transition-all duration-300`}>
                <div className="p-6 border-b border-gray-200 dark:border-white/10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        {sidebarOpen && (
                            <div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">SPMS</span>
                                <span className="block text-xs text-purple-600 dark:text-purple-400">Faculty Portal</span>
                            </div>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                                {sidebarOpen && (
                                    <>
                                        <span className="font-medium">{item.label}</span>
                                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-white/10">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">Faculty Guide</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all">
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-8 py-4 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30" />
                                <input type="text" placeholder="Search..." className="w-64 pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all" />
                            </div>
                            <button className="relative p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all">
                                <Bell className="w-5 h-5 text-gray-500 dark:text-white/50" />
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-purple-500 rounded-full"></span>
                            </button>
                            <UserProfileDropdown user={user!} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

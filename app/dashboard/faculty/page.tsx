'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserProfileDropdown from '@/components/UserProfileDropdown';
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
    TrendingUp,
    Clock,
    CheckCircle,
    MessageSquare
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
}

export default function FacultyDashboard() {
    const router = useRouter();
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
        { icon: Home, label: 'Dashboard', href: '/dashboard/faculty', active: true },
        { icon: Users, label: 'My Groups', href: '/dashboard/faculty/groups' },
        { icon: Calendar, label: 'Meetings', href: '/dashboard/faculty/meetings' },
        { icon: ClipboardList, label: 'Evaluations', href: '/dashboard/faculty/evaluations' },
        { icon: FolderKanban, label: 'Projects', href: '/dashboard/faculty/projects' },
        { icon: MessageSquare, label: 'Messages', href: '/dashboard/faculty/messages' },
    ];

    const stats = [
        { label: 'My Groups', value: '6', icon: Users, color: 'purple' },
        { label: 'Scheduled Meetings', value: '3', icon: Calendar, trend: 'Today', color: 'cyan' },
        { label: 'Pending Reviews', value: '8', icon: ClipboardList, color: 'amber' },
        { label: 'Completed Projects', value: '15', icon: CheckCircle, trend: '+3', color: 'emerald' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px]"></div>
            </div>

            <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} relative bg-white/[0.02] border-r border-white/10 flex flex-col transition-all duration-300`}>
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        {sidebarOpen && (
                            <div>
                                <span className="text-xl font-bold text-white">SPMS</span>
                                <span className="block text-xs text-purple-400">Faculty Portal</span>
                            </div>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active
                                ? 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${item.active ? 'text-purple-400' : ''}`} />
                            {sidebarOpen && (
                                <>
                                    <span className="font-medium">{item.label}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-purple-400">Faculty Guide</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1>
                                <p className="text-white/40 text-sm">Manage your groups and projects</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input type="text" placeholder="Search..." className="w-64 pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all" />
                            </div>
                            <button className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                                <Bell className="w-5 h-5 text-white/50" />
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-purple-500 rounded-full"></span>
                            </button>
                            <UserProfileDropdown user={user} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                    </div>
                                    {stat.trend && (
                                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white/5 text-white/50">{stat.trend}</span>
                                    )}
                                </div>
                                <p className="text-white/40 text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/dashboard/faculty/groups" className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-left">
                                <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-white">My Groups</p>
                                <p className="text-sm text-white/40">View assigned groups</p>
                            </Link>
                            <Link href="/dashboard/faculty/meetings" className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-left">
                                <Calendar className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-white">Schedule Meeting</p>
                                <p className="text-sm text-white/40">Create new meeting</p>
                            </Link>
                            <Link href="/dashboard/faculty/evaluations" className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left">
                                <ClipboardList className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-white">Review Projects</p>
                                <p className="text-sm text-white/40">Pending reviews</p>
                            </Link>
                            <Link href="/dashboard/faculty/projects" className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left">
                                <TrendingUp className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-white">Analytics</p>
                                <p className="text-sm text-white/40">View progress</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

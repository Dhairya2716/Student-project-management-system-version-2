'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    ClipboardList,
    Calendar,
    FolderKanban,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText';
import CountUp from '@/components/reactbits/CountUp';
import SpotlightCard from '@/components/reactbits/SpotlightCard';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
}

interface FacultyStats {
    totalGroups: number;
    scheduledMeetings: number;
    pendingSubmissions: number;
    completedGroups: number;
}

export default function FacultyDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<FacultyStats>({
        totalGroups: 0,
        scheduledMeetings: 0,
        pendingSubmissions: 0,
        completedGroups: 0
    });

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
            // Fetch live stats
            fetch('/api/faculty/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => {
                    if (data && !data.error) setStats(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } catch {
            router.push('/login');
        }
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="relative">
                    <div className="w-14 h-14 border-4 border-purple-200 dark:border-purple-500/20 border-t-purple-500 dark:border-t-purple-400 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const statCards = [
        { label: 'My Groups', value: stats.totalGroups, icon: Users, bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
        { label: 'Scheduled Meetings', value: stats.scheduledMeetings, icon: Calendar, bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400' },
        { label: 'Pending Reviews', value: stats.pendingSubmissions, icon: ClipboardList, bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
        { label: 'Completed Groups', value: stats.completedGroups, icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
    ];

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
                <BlurText
                    text="Faculty Dashboard"
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    delay={80}
                    animateBy="words"
                />
                <p className="text-gray-500 dark:text-gray-400">Manage your groups and projects</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
                {statCards.map((stat, i) => (
                    <SpotlightCard
                        key={i}
                        className="group p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] card-hover shadow-sm hover:shadow-lg transition-all"
                        spotlightColor="rgba(139, 92, 246, 0.12)"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`w-6 h-6 ${stat.text}`} />
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            <CountUp to={stat.value} duration={2} />
                        </p>
                    </SpotlightCard>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                    <Link href="/dashboard/faculty/groups" className="group p-5 rounded-2xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-purple-300 dark:hover:border-purple-500/30 transition-all text-left card-hover">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">My Groups</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View assigned groups</p>
                    </Link>
                    <Link href="/dashboard/faculty/meetings" className="group p-5 rounded-2xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all text-left card-hover">
                        <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Schedule Meeting</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Create new meeting</p>
                    </Link>
                    <Link href="/dashboard/faculty/evaluations" className="group p-5 rounded-2xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-amber-300 dark:hover:border-amber-500/30 transition-all text-left card-hover">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Review Projects</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pending reviews</p>
                    </Link>
                    <Link href="/dashboard/faculty/projects" className="group p-5 rounded-2xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all text-left card-hover">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Analytics</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View progress</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import StudentLayout from '@/components/StudentLayout';
import {
    Users,
    Calendar,
    CheckCircle,
    TrendingUp,
    Clock,
    Award,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import BlurText from '@/components/reactbits/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';

interface DashboardStats {
    hasGroup: boolean;
    groupName: string | null;
    totalMeetings: number;
    attendedMeetings: number;
    upcomingMeetings: number;
    attendancePercentage: number;
    isLeader: boolean;
    cgpa: number | null;
}

interface StudentData {
    student: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        enrollment_no: string | null;
        department: { name: string; code: string } | null;
        batch: { name: string } | null;
    };
    stats: DashboardStats;
}

export default function StudentDashboard() {
    const [data, setData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const dashboardData = await response.json();
                setData(dashboardData);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex items-center justify-center h-full min-h-[60vh]">
                    <div className="relative">
                        <div className="w-14 h-14 border-4 border-emerald-200 dark:border-emerald-500/20 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    if (!data) {
        return (
            <StudentLayout>
                <div className="p-6">
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] shadow-sm">
                        <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Failed to load dashboard</p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    const { student, stats } = data;

    const statCards = [
        {
            label: 'My Team',
            value: stats.hasGroup ? stats.groupName : 'Not Assigned',
            icon: Users,
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-200 dark:border-emerald-500/20',
            text: 'text-emerald-600 dark:text-emerald-400',
            href: '/dashboard/student/team',
            badge: stats.isLeader ? 'Leader' : null
        },
        {
            label: 'Upcoming Meetings',
            value: stats.upcomingMeetings,
            icon: Calendar,
            bg: 'bg-cyan-50 dark:bg-cyan-500/10',
            border: 'border-cyan-200 dark:border-cyan-500/20',
            text: 'text-cyan-600 dark:text-cyan-400',
            href: '/dashboard/student/meetings'
        },
        {
            label: 'Attendance',
            value: `${stats.attendancePercentage}%`,
            icon: CheckCircle,
            bg: stats.attendancePercentage >= 75 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10',
            border: stats.attendancePercentage >= 75 ? 'border-emerald-200 dark:border-emerald-500/20' : 'border-amber-200 dark:border-amber-500/20',
            text: stats.attendancePercentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
            href: '/dashboard/student/meetings',
            subtext: `${stats.attendedMeetings}/${stats.totalMeetings} meetings`
        },
        {
            label: 'CGPA',
            value: stats.cgpa ? stats.cgpa.toFixed(2) : 'N/A',
            icon: Award,
            bg: 'bg-purple-50 dark:bg-purple-500/10',
            border: 'border-purple-200 dark:border-purple-500/20',
            text: 'text-purple-600 dark:text-purple-400',
            href: '/dashboard/student/profile'
        }
    ];

    return (
        <StudentLayout>
            <div className="p-6">
                {/* Page Header */}
                <div className="mb-8">
                    <BlurText
                        text={`Welcome back, ${student.name.split(' ')[0]}! 👋`}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                        delay={80}
                        animateBy="words"
                    />
                    <p className="text-gray-500 dark:text-gray-400">
                        {student.enrollment_no} • {student.department?.name} • {student.batch?.name}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
                    {statCards.map((stat, i) => (
                        <Link
                            key={i}
                            href={stat.href}
                            className="block"
                        >
                            <SpotlightCard
                                className="group p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] card-hover shadow-sm hover:shadow-lg transition-all h-full"
                                spotlightColor="rgba(16, 185, 129, 0.12)"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className={`w-6 h-6 ${stat.text}`} />
                                    </div>
                                    {stat.badge && (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                            {stat.badge}
                                        </span>
                                    )}
                                    <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                                {stat.subtext && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{stat.subtext}</p>
                                )}
                            </SpotlightCard>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions + Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                    <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link href="/dashboard/student/team" className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">View My Team</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">See team members and details</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                            <Link href="/dashboard/student/meetings" className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200/60 dark:border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">View Meetings</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Check schedule and attendance</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                            <Link href="/dashboard/student/project" className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Project Details</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">View project information</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Status Overview</h2>
                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Group Status</span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${stats.hasGroup
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                        }`}>
                                        {stats.hasGroup ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                </div>
                                {stats.hasGroup && (
                                    <p className="text-gray-900 dark:text-white font-semibold">{stats.groupName}</p>
                                )}
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${stats.attendancePercentage >= 75
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                        }`}>
                                        {stats.attendancePercentage >= 75 ? 'Good' : 'Low'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${stats.attendancePercentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                                            style={{ width: `${stats.attendancePercentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3ch]">{stats.attendancePercentage}%</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200/60 dark:border-cyan-500/20 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Meetings</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.upcomingMeetings}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert if not assigned to group */}
                {!stats.hasGroup && (
                    <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 shadow-sm animate-fade-in-up">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-1">Not Assigned to a Group</h3>
                                <p className="text-amber-600/80 dark:text-amber-300/60 text-sm">
                                    You haven&apos;t been assigned to a project group yet. Please contact your faculty coordinator or admin for assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

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
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            </StudentLayout>
        );
    }

    if (!data) {
        return (
            <StudentLayout>
                <div className="p-8">
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <AlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg">Failed to load dashboard</p>
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
            color: 'emerald',
            href: '/dashboard/student/team',
            badge: stats.isLeader ? 'Leader' : null
        },
        {
            label: 'Upcoming Meetings',
            value: stats.upcomingMeetings,
            icon: Calendar,
            color: 'cyan',
            href: '/dashboard/student/meetings'
        },
        {
            label: 'Attendance',
            value: `${stats.attendancePercentage}%`,
            icon: CheckCircle,
            color: stats.attendancePercentage >= 75 ? 'emerald' : 'amber',
            href: '/dashboard/student/meetings',
            subtext: `${stats.attendedMeetings}/${stats.totalMeetings} meetings`
        },
        {
            label: 'CGPA',
            value: stats.cgpa ? stats.cgpa.toFixed(2) : 'N/A',
            icon: Award,
            color: 'purple',
            href: '/dashboard/student/profile'
        }
    ];

    return (
        <StudentLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {student.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-white/50">
                        {student.enrollment_no} • {student.department?.name} • {student.batch?.name}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, i) => (
                        <Link
                            key={i}
                            href={stat.href}
                            className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                                {stat.badge && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        {stat.badge}
                                    </span>
                                )}
                                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-white/40 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                            {stat.subtext && (
                                <p className="text-xs text-white/30">{stat.subtext}</p>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link href="/dashboard/student/team" className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">View My Team</p>
                                        <p className="text-sm text-white/40">See team members and details</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                            </Link>
                            <Link href="/dashboard/student/meetings" className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">View Meetings</p>
                                        <p className="text-sm text-white/40">Check schedule and attendance</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                            </Link>
                            <Link href="/dashboard/student/project" className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Project Details</p>
                                        <p className="text-sm text-white/40">View project information</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-purple-400 transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Status Overview</h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/40">Group Status</span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${stats.hasGroup ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                        {stats.hasGroup ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                </div>
                                {stats.hasGroup && (
                                    <p className="text-white font-medium">{stats.groupName}</p>
                                )}
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/40">Attendance Rate</span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${stats.attendancePercentage >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {stats.attendancePercentage >= 75 ? 'Good' : 'Low'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${stats.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                            style={{ width: `${stats.attendancePercentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-white">{stats.attendancePercentage}%</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/40">Upcoming Meetings</p>
                                        <p className="text-xl font-bold text-white">{stats.upcomingMeetings}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert if not assigned to group */}
                {!stats.hasGroup && (
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-amber-400 mb-2">Not Assigned to a Group</h3>
                                <p className="text-white/60">
                                    You haven't been assigned to a project group yet. Please contact your faculty coordinator or admin for assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

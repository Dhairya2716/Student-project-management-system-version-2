'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    GraduationCap,
    Users,
    FolderKanban,
    Clock,
    TrendingUp,
    Building,
    BookOpen,
    UserPlus,
    FileCheck,
    Loader2,
    ArrowRight
} from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText';
import CountUp from '@/components/reactbits/CountUp';
import SpotlightCard from '@/components/reactbits/SpotlightCard';

interface Stats {
    students: number;
    staff: number;
    departments: number;
    batches: number;
    projects: number;
    pendingGroups: number;
}

export default function AdminDashboardHome() {
    const [stats, setStats] = useState<Stats>({ students: 0, staff: 0, departments: 0, batches: 0, projects: 0, pendingGroups: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [studentsRes, staffRes, deptsRes, batchesRes, projectsRes] = await Promise.all([
                fetch('/api/admin/students'),
                fetch('/api/admin/staff'),
                fetch('/api/admin/departments'),
                fetch('/api/admin/batches'),
                fetch('/api/admin/projects'),
            ]);

            const [students, staff, depts, batches, projects] = await Promise.all([
                studentsRes.ok ? studentsRes.json() : [],
                staffRes.ok ? staffRes.json() : [],
                deptsRes.ok ? deptsRes.json() : [],
                batchesRes.ok ? batchesRes.json() : [],
                projectsRes.ok ? projectsRes.json() : [],
            ]);

            setStats({
                students: students.length,
                staff: staff.length,
                departments: depts.length,
                batches: batches.length,
                projects: Array.isArray(projects) ? projects.filter((p: any) => p.status === 'APPROVED').length : 0,
                pendingGroups: Array.isArray(projects) ? projects.filter((p: any) => p.status === 'PENDING').length : 0,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Students', value: stats.students, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', href: '/dashboard/admin/students' },
        { label: 'Staff Members', value: stats.staff, icon: Users, gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', href: '/dashboard/admin/staff' },
        { label: 'Departments', value: stats.departments, icon: Building, gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-600 dark:text-purple-400', href: '/dashboard/admin/departments' },
        { label: 'Batches', value: stats.batches, icon: BookOpen, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', href: '/dashboard/admin/batches' },
    ];

    const quickActions = [
        { icon: UserPlus, label: 'Add Staff', desc: 'New faculty member', href: '/dashboard/admin/staff', gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50 dark:bg-orange-500/10', hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-500/30', text: 'text-orange-600 dark:text-orange-400' },
        { icon: GraduationCap, label: 'Add Student', desc: 'Register student', href: '/dashboard/admin/students', gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-500/30', text: 'text-cyan-600 dark:text-cyan-400' },
        { icon: Building, label: 'Add Department', desc: 'Create department', href: '/dashboard/admin/departments', gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-500/10', hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-500/30', text: 'text-purple-600 dark:text-purple-400' },
        { icon: BookOpen, label: 'Add Batch', desc: 'Create batch', href: '/dashboard/admin/batches', gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50 dark:bg-amber-500/10', hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-500/30', text: 'text-amber-600 dark:text-amber-400' },
    ];

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <BlurText
                    text="Admin Dashboard"
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    delay={80}
                    animateBy="words"
                />
                <p className="text-gray-500 dark:text-gray-400">Welcome back! Here&apos;s an overview of your institution.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/[0.05] mb-4"></div>
                            <div className="h-4 w-20 bg-gray-100 dark:bg-white/[0.05] rounded mb-2"></div>
                            <div className="h-8 w-16 bg-gray-100 dark:bg-white/[0.05] rounded"></div>
                        </div>
                    ))
                ) : (
                    statCards.map((stat, i) => (
                        <Link
                            key={i}
                            href={stat.href}
                            className="block"
                        >
                            <SpotlightCard
                                className="group p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] card-hover shadow-sm hover:shadow-lg transition-all"
                                spotlightColor="rgba(16, 185, 129, 0.12)"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className={`w-6 h-6 ${stat.text}`} />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    <CountUp to={stat.value} duration={2} />
                                </p>
                            </SpotlightCard>
                        </Link>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                    {quickActions.map((action, i) => (
                        <Link
                            key={i}
                            href={action.href}
                            className={`group p-5 rounded-2xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] ${action.hoverBorder} transition-all text-left card-hover`}
                        >
                            <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className={`w-5 h-5 ${action.text}`} />
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{action.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{action.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* System Overview */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-5 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05] group hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Active Projects</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.projects}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Projects currently in progress</p>
                    </div>
                    <div className="p-5 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05] group hover:border-amber-200 dark:hover:border-amber-500/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Pending Tasks</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.pendingGroups}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Approvals and reviews pending</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

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

interface Stats {
    students: number;
    staff: number;
    departments: number;
    batches: number;
    projects: number;
}

export default function AdminDashboardHome() {
    const [stats, setStats] = useState<Stats>({ students: 0, staff: 0, departments: 0, batches: 0, projects: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [studentsRes, staffRes, deptsRes, batchesRes] = await Promise.all([
                fetch('/api/admin/students'),
                fetch('/api/admin/staff'),
                fetch('/api/admin/departments'),
                fetch('/api/admin/batches'),
            ]);

            const [students, staff, depts, batches] = await Promise.all([
                studentsRes.ok ? studentsRes.json() : [],
                staffRes.ok ? staffRes.json() : [],
                deptsRes.ok ? deptsRes.json() : [],
                batchesRes.ok ? batchesRes.json() : [],
            ]);

            setStats({
                students: students.length,
                staff: staff.length,
                departments: depts.length,
                batches: batches.length,
                projects: 0,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'emerald', href: '/dashboard/admin/students' },
        { label: 'Staff Members', value: stats.staff, icon: Users, color: 'cyan', href: '/dashboard/admin/staff' },
        { label: 'Departments', value: stats.departments, icon: Building, color: 'purple', href: '/dashboard/admin/departments' },
        { label: 'Batches', value: stats.batches, icon: BookOpen, color: 'amber', href: '/dashboard/admin/batches' },
    ];

    const quickActions = [
        { icon: UserPlus, label: 'Add Staff', desc: 'New faculty member', href: '/dashboard/admin/staff', color: 'orange' },
        { icon: GraduationCap, label: 'Add Student', desc: 'Register student', href: '/dashboard/admin/students', color: 'cyan' },
        { icon: Building, label: 'Add Department', desc: 'Create department', href: '/dashboard/admin/departments', color: 'purple' },
        { icon: BookOpen, label: 'Add Batch', desc: 'Create batch', href: '/dashboard/admin/batches', color: 'amber' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-white/50">Welcome back! Here&apos;s an overview of your institution.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-white/5 mb-4"></div>
                            <div className="h-4 w-20 bg-white/5 rounded mb-2"></div>
                            <div className="h-8 w-16 bg-white/5 rounded"></div>
                        </div>
                    ))
                ) : (
                    statCards.map((stat, i) => (
                        <Link
                            key={i}
                            href={stat.href}
                            className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-white/40 text-sm mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </Link>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, i) => (
                        <Link
                            key={i}
                            href={action.href}
                            className={`group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-${action.color}-500/30 hover:bg-${action.color}-500/5 transition-all text-left`}
                        >
                            <action.icon className={`w-8 h-8 text-${action.color}-400 mb-3 group-hover:scale-110 transition-transform`} />
                            <p className="font-medium text-white">{action.label}</p>
                            <p className="text-sm text-white/40">{action.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="font-medium text-white">Active Projects</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stats.projects}</p>
                        <p className="text-sm text-white/40">Projects currently in progress</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="font-medium text-white">Pending Tasks</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">0</p>
                        <p className="text-sm text-white/40">Approvals and reviews pending</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

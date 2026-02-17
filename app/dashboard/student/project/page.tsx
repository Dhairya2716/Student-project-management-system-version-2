'use client';

import { useEffect, useState } from 'react';
import StudentLayout from '@/components/StudentLayout';
import {
    FolderKanban,
    Users,
    Calendar,
    Award,
    Building,
    AlertCircle,
    FileText,
    TrendingUp
} from 'lucide-react';

interface GroupData {
    id: number;
    name: string;
    title: string;
    area: string | null;
    description: string | null;
    average_cpi: number | null;
    project_type: { name: string } | null;
    memberCount: number;
    meetingCount: number;
    upcomingMeetings: number;
    isLeader: boolean;
    myCgpa: number | null;
}

export default function StudentProjectPage() {
    const [group, setGroup] = useState<GroupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchGroup();
    }, []);

    const fetchGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/group', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGroup(data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Error fetching group:', err);
            setError(true);
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

    if (error || !group) {
        return (
            <StudentLayout>
                <div className="p-8">
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <AlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No Project Assigned</h2>
                        <p className="text-white/40">You haven't been assigned to a project yet.</p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Project Details</h1>
                    <p className="text-white/50">View your project information and progress</p>
                </div>

                {/* Project Header */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-8 mb-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center flex-shrink-0">
                            <FolderKanban className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">{group.name}</h2>
                            <p className="text-lg text-white/80 mb-3">{group.title}</p>
                            {group.project_type && (
                                <span className="inline-block px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {group.project_type.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {group.description && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-white/60" />
                                <span className="text-sm font-medium text-white/70">Description</span>
                            </div>
                            <p className="text-white/80">{group.description}</p>
                        </div>
                    )}

                    {group.area && (
                        <div className="flex items-center gap-2 mt-4 text-white/70">
                            <Building className="w-4 h-4" />
                            <span className="text-sm">Project Area: <span className="font-medium text-white">{group.area}</span></span>
                        </div>
                    )}
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-white/40 text-sm mb-1">Team Members</p>
                        <p className="text-3xl font-bold text-white">{group.memberCount}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-cyan-400" />
                            </div>
                        </div>
                        <p className="text-white/40 text-sm mb-1">Total Meetings</p>
                        <p className="text-3xl font-bold text-white">{group.meetingCount}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                        <p className="text-white/40 text-sm mb-1">Upcoming Meetings</p>
                        <p className="text-3xl font-bold text-white">{group.upcomingMeetings}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                        <p className="text-white/40 text-sm mb-1">Average CPI</p>
                        <p className="text-3xl font-bold text-white">
                            {group.average_cpi ? group.average_cpi.toFixed(2) : 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Project Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Project Information</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                <p className="text-sm text-white/40 mb-1">Project ID</p>
                                <p className="text-white font-medium">#{group.id}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                <p className="text-sm text-white/40 mb-1">Group Name</p>
                                <p className="text-white font-medium">{group.name}</p>
                            </div>
                            {group.project_type && (
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                    <p className="text-sm text-white/40 mb-1">Project Type</p>
                                    <p className="text-white font-medium">{group.project_type.name}</p>
                                </div>
                            )}
                            {group.area && (
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                    <p className="text-sm text-white/40 mb-1">Project Area</p>
                                    <p className="text-white font-medium">{group.area}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">My Role</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                <p className="text-sm text-white/40 mb-1">Position</p>
                                <p className="text-white font-medium">
                                    {group.isLeader ? 'Team Leader' : 'Team Member'}
                                </p>
                            </div>
                            {group.myCgpa && (
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                    <p className="text-sm text-white/40 mb-1">My CGPA</p>
                                    <p className="text-white font-medium">{group.myCgpa.toFixed(2)}</p>
                                </div>
                            )}
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    <p className="text-sm font-medium text-emerald-400">Active Contributor</p>
                                </div>
                                <p className="text-sm text-white/60">
                                    You are an active member of this project team
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

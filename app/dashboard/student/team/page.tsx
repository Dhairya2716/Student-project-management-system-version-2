'use client';

import { useEffect, useState } from 'react';
import StudentLayout from '@/components/StudentLayout';
import {
    Users,
    Mail,
    Phone,
    Award,
    Building,
    Calendar,
    AlertCircle,
    Loader2,
    Crown
} from 'lucide-react';

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    enrollment_no: string | null;
    department: { name: string; code: string } | null;
    batch: { name: string } | null;
}

interface GroupMember {
    is_leader: boolean;
    cgpa: number | null;
    student: Student;
}

interface Faculty {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface GroupData {
    id: number;
    name: string;
    title: string;
    area: string | null;
    description: string | null;
    average_cpi: number | null;
    project_type: { name: string } | null;
    staff_project_group_guide_idTostaff: Faculty | null;
    staff_project_group_convener_idTostaff: Faculty | null;
    staff_project_group_expert_idTostaff: Faculty | null;
    project_group_member: GroupMember[];
    memberCount: number;
    meetingCount: number;
    upcomingMeetings: number;
    isLeader: boolean;
    myCgpa: number | null;
}

export default function StudentTeamPage() {
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
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Not Assigned to a Group</h2>
                        <p className="text-gray-500 dark:text-gray-400">You haven't been assigned to a project group yet.</p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Team</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your project group and team members</p>
                </div>

                {/* Group Info Card */}
                <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">{group.title}</p>
                            {group.project_type && (
                                <span className="inline-block px-3 py-1 text-sm rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {group.project_type.name}
                                </span>
                            )}
                        </div>
                        {group.isLeader && (
                            <span className="px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2">
                                <Crown className="w-4 h-4" />
                                Team Leader
                            </span>
                        )}
                    </div>

                    {group.description && (
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{group.description}</p>
                    )}

                    {group.area && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Building className="w-4 h-4" />
                            <span>Area: {group.area}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Members</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{group.memberCount}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Total Meetings</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{group.meetingCount}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Award className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Avg CPI</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {group.average_cpi ? group.average_cpi.toFixed(2) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Faculty Members */}
                <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Faculty</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {group.staff_project_group_guide_idTostaff && (
                            <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <span className="text-xs text-emerald-400 font-medium mb-2 block">Guide</span>
                                <p className="font-medium text-gray-900 dark:text-white mb-1">{group.staff_project_group_guide_idTostaff.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{group.staff_project_group_guide_idTostaff.email}</span>
                                </div>
                                {group.staff_project_group_guide_idTostaff.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Phone className="w-3 h-3" />
                                        <span>{group.staff_project_group_guide_idTostaff.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {group.staff_project_group_convener_idTostaff && (
                            <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <span className="text-xs text-cyan-400 font-medium mb-2 block">Convener</span>
                                <p className="font-medium text-gray-900 dark:text-white mb-1">{group.staff_project_group_convener_idTostaff.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{group.staff_project_group_convener_idTostaff.email}</span>
                                </div>
                                {group.staff_project_group_convener_idTostaff.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Phone className="w-3 h-3" />
                                        <span>{group.staff_project_group_convener_idTostaff.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {group.staff_project_group_expert_idTostaff && (
                            <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <span className="text-xs text-purple-400 font-medium mb-2 block">Expert</span>
                                <p className="font-medium text-gray-900 dark:text-white mb-1">{group.staff_project_group_expert_idTostaff.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{group.staff_project_group_expert_idTostaff.email}</span>
                                </div>
                                {group.staff_project_group_expert_idTostaff.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Phone className="w-3 h-3" />
                                        <span>{group.staff_project_group_expert_idTostaff.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Team Members */}
                <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Team Members</h3>
                    <div className="space-y-3">
                        {group.project_group_member.map((member) => (
                            <div key={member.student.id} className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-emerald-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                                            <span className="text-gray-900 dark:text-white font-bold text-lg">{member.student.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-white">{member.student.name}</p>
                                                {member.is_leader && (
                                                    <Crown className="w-4 h-4 text-amber-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.student.enrollment_no}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{member.student.email}</span>
                                                </div>
                                                {member.student.phone && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{member.student.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {member.cgpa && (
                                            <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                                <span className="text-xs text-purple-400">CGPA</span>
                                                <p className="text-lg font-bold text-white">{member.cgpa.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

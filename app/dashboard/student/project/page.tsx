'use client';

import { useEffect, useState, useRef } from 'react';
import StudentLayout from '@/components/StudentLayout';
import {
    FolderKanban,
    Users,
    Calendar,
    Award,
    Building,
    AlertCircle,
    FileText,
    TrendingUp,
    Link as LinkIcon,
    Plus,
    Clock,
    ExternalLink,
    Search,
    UserPlus,
    UserMinus,
    Crown,
    X
} from 'lucide-react';

interface Member {
    id: number;
    student_id: number;
    is_leader: boolean | null;
    cgpa: number | null;
    student: {
        id: number;
        name: string;
        email: string;
        enrollment_no: string | null;
    };
}

interface GroupData {
    id: number;
    name: string;
    title: string;
    area: string | null;
    description: string | null;
    average_cpi: number | null;
    project_type: { name: string } | null;
    project_group_member: Member[];
    memberCount: number;
    meetingCount: number;
    upcomingMeetings: number;
    isLeader: boolean;
    myCgpa: number | null;
}

interface Submission {
    id: number;
    title: string;
    description: string | null;
    link: string | null;
    fileUrl: string | null;
    submission_type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    student: { name: string };
}

interface AvailableStudent {
    id: number;
    name: string;
    enrollment_no: string;
}

export default function StudentProjectPage() {
    const [group, setGroup] = useState<GroupData | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'submissions'>('overview');

    // Member management
    const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [memberActionLoading, setMemberActionLoading] = useState(false);
    const [memberMsg, setMemberMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Submission Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSubmission, setNewSubmission] = useState({
        title: '',
        link: '',
        description: '',
        submission_type: 'LINK'
    });
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchGroup();
        fetchSubmissions();
    }, []);

    useEffect(() => {
        if (group?.isLeader) {
            fetchAvailableStudents();
        }
    }, [group?.isLeader]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowMemberDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const token = () => localStorage.getItem('token');

    const fetchGroup = async () => {
        try {
            const response = await fetch('/api/student/group', {
                headers: { 'Authorization': `Bearer ${token()}` }
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

    const fetchAvailableStudents = async () => {
        try {
            const res = await fetch('/api/student/available-students', {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableStudents(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching available students:', err);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch('/api/student/submissions', {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        }
    };

    const handleAddMember = async (student: AvailableStudent) => {
        if (!group) return;
        setMemberActionLoading(true);
        setMemberMsg(null);
        setShowMemberDropdown(false);
        setMemberSearch('');
        try {
            const res = await fetch('/api/student/group/members', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ student_id: student.id, group_id: group.id })
            });
            const data = await res.json();
            if (res.ok) {
                setMemberMsg({ type: 'success', text: `${student.name} added to the group.` });
                // Update local state: add member + refresh CPI
                setGroup(prev => prev ? {
                    ...prev,
                    average_cpi: data.average_cpi,
                    memberCount: prev.memberCount + 1,
                    project_group_member: [
                        ...prev.project_group_member,
                        {
                            id: Date.now(),
                            student_id: student.id,
                            is_leader: false,
                            cgpa: null,
                            student: { id: student.id, name: student.name, email: '', enrollment_no: student.enrollment_no }
                        }
                    ]
                } : prev);
                // Refresh available students list
                fetchAvailableStudents();
            } else {
                setMemberMsg({ type: 'error', text: data.error || 'Failed to add member.' });
            }
        } catch {
            setMemberMsg({ type: 'error', text: 'An error occurred while adding the member.' });
        } finally {
            setMemberActionLoading(false);
        }
    };

    const handleRemoveMember = async (studentId: number, studentName: string) => {
        if (!group) return;
        setMemberActionLoading(true);
        setMemberMsg(null);
        try {
            const res = await fetch(
                `/api/student/group/members?group_id=${group.id}&student_id=${studentId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token()}` }
                }
            );
            const data = await res.json();
            if (res.ok) {
                setMemberMsg({ type: 'success', text: `${studentName} removed from the group.` });
                setGroup(prev => prev ? {
                    ...prev,
                    average_cpi: data.average_cpi,
                    memberCount: prev.memberCount - 1,
                    project_group_member: prev.project_group_member.filter(m => m.student_id !== studentId)
                } : prev);
                fetchAvailableStudents();
            } else {
                setMemberMsg({ type: 'error', text: data.error || 'Failed to remove member.' });
            }
        } catch {
            setMemberMsg({ type: 'error', text: 'An error occurred while removing the member.' });
        } finally {
            setMemberActionLoading(false);
        }
    };

    const handleCreateSubmission = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newSubmission.submission_type === 'FILE' && !file) {
            alert('Please select a file to upload');
            return;
        }

        if (newSubmission.submission_type === 'LINK' && !newSubmission.link) {
            alert('Please provide a valid link');
            return;
        }

        setIsSubmitting(true);
        try {
            let fileUrl = null;

            if (newSubmission.submission_type === 'FILE' && file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    fileUrl = data.url;
                } else {
                    throw new Error('File upload failed');
                }
            }

            const response = await fetch('/api/student/submissions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newSubmission,
                    fileUrl
                })
            });

            if (response.ok) {
                setNewSubmission({ title: '', link: '', description: '', submission_type: 'LINK' });
                setFile(null);
                fetchSubmissions();
            }
        } catch (error) {
            console.error('Error creating submission:', error);
            alert('Failed to create submission');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAvailableStudents = availableStudents.filter(s =>
        s.name.toLowerCase().includes(memberSearch.toLowerCase())
    );

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
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Project Assigned</h2>
                        <p className="text-gray-500 dark:text-gray-400">You haven't been assigned to a project yet.</p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'members', label: `Members (${group.project_group_member?.length ?? group.memberCount})` },
        { key: 'submissions', label: 'Submissions' }
    ] as const;

    return (
        <StudentLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Details</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your project information and progress</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-8 w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === tab.key
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ===== OVERVIEW TAB ===== */}
                {activeTab === 'overview' && (
                    <>
                        {/* Project Header */}
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-8 mb-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center flex-shrink-0">
                                    <FolderKanban className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h2>
                                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">{group.title}</p>
                                    {group.project_type && (
                                        <span className="inline-block px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            {group.project_type.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {group.description && (
                                <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Description</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{group.description}</p>
                                </div>
                            )}

                            {group.area && (
                                <div className="flex items-center gap-2 mt-4 text-gray-600 dark:text-gray-300">
                                    <Building className="w-4 h-4" />
                                    <span className="text-sm">Project Area: <span className="font-medium text-white">{group.area}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {[
                                { label: 'Team Members', value: group.memberCount, icon: Users, color: 'emerald' },
                                { label: 'Total Meetings', value: group.meetingCount, icon: Calendar, color: 'cyan' },
                                { label: 'Upcoming Meetings', value: group.upcomingMeetings, icon: TrendingUp, color: 'purple' },
                                { label: 'Average CPI', value: group.average_cpi ? group.average_cpi.toFixed(2) : 'N/A', icon: Award, color: 'amber' }
                            ].map((stat) => (
                                <div key={stat.label} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                                            <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                        </div>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* My Role */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Group Name</p>
                                        <p className="text-gray-900 dark:text-white font-medium">{group.name}</p>
                                    </div>
                                    {group.project_type && (
                                        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Type</p>
                                            <p className="text-gray-900 dark:text-white font-medium">{group.project_type.name}</p>
                                        </div>
                                    )}
                                    {group.area && (
                                        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Area</p>
                                            <p className="text-gray-900 dark:text-white font-medium">{group.area}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Role</h3>
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Position</p>
                                        <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                            {group.isLeader && <Crown className="w-4 h-4 text-amber-400" />}
                                            {group.isLeader ? 'Team Leader' : 'Team Member'}
                                        </p>
                                    </div>
                                    {group.myCgpa && (
                                        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">My CGPA</p>
                                            <p className="text-gray-900 dark:text-white font-medium">{group.myCgpa.toFixed(2)}</p>
                                        </div>
                                    )}
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                            <p className="text-sm font-medium text-emerald-400">Active Contributor</p>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            You are an active member of this project team
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ===== MEMBERS TAB ===== */}
                {activeTab === 'members' && (
                    <div className="space-y-6">
                        {/* Average CPI live display */}
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">Group Average CPI</p>
                                    <p className="text-3xl font-bold text-amber-400">
                                        {group.average_cpi ? group.average_cpi.toFixed(2) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-amber-600/60 dark:text-amber-400/60 max-w-[200px] text-right">
                                Automatically recalculated when members are added or removed
                            </p>
                        </div>

                        {/* Leader-only: Add member */}
                        {group.isLeader && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-emerald-400" />
                                    Add Team Member
                                </h3>

                                {memberMsg && (
                                    <div className={`mb-4 flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${memberMsg.type === 'success'
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20'
                                        }`}>
                                        {memberMsg.type === 'success'
                                            ? <TrendingUp className="w-4 h-4 shrink-0" />
                                            : <AlertCircle className="w-4 h-4 shrink-0" />
                                        }
                                        {memberMsg.text}
                                        <button onClick={() => setMemberMsg(null)} className="ml-auto">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div ref={searchRef}>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={memberSearch}
                                            onChange={(e) => { setMemberSearch(e.target.value); setShowMemberDropdown(true); }}
                                            onFocus={() => setShowMemberDropdown(true)}
                                            placeholder="Search for a student by name..."
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                    {showMemberDropdown && (
                                        <div className="mt-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg max-h-52 overflow-y-auto">
                                            {filteredAvailableStudents.length > 0 ? (
                                                filteredAvailableStudents.map(student => (
                                                    <button
                                                        key={student.id}
                                                        type="button"
                                                        disabled={memberActionLoading}
                                                        onMouseDown={(e) => { e.preventDefault(); handleAddMember(student); }}
                                                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-b border-gray-100 dark:border-white/5 last:border-0 flex items-center gap-3 transition-colors disabled:opacity-50"
                                                    >
                                                        <UserPlus className="w-4 h-4 text-emerald-500 shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.enrollment_no}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                    {memberSearch ? `No students matching "${memberSearch}"` : 'No available students to add'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Members list */}
                        <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Members</h3>
                            <div className="space-y-3">
                                {(group.project_group_member ?? []).map((member) => (
                                    <div key={member.student_id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-emerald-500/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.is_leader
                                                ? 'bg-amber-500/20 border border-amber-500/30'
                                                : 'bg-gray-200 dark:bg-white/10'
                                                }`}>
                                                {member.is_leader
                                                    ? <Crown className="w-5 h-5 text-amber-400" />
                                                    : <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{member.student?.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {member.student?.enrollment_no ?? 'N/A'}
                                                    {member.is_leader && <span className="ml-2 text-amber-500 font-medium">· Leader</span>}
                                                    {member.cgpa && <span className="ml-2">· CGPA: {member.cgpa.toFixed(2)}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        {group.isLeader && !member.is_leader && (
                                            <button
                                                disabled={memberActionLoading}
                                                onClick={() => handleRemoveMember(member.student_id, member.student?.name)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                title="Remove member"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== SUBMISSIONS TAB ===== */}
                {activeTab === 'submissions' && (
                    <div className="space-y-6">
                        {/* Create Submission */}
                        <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-400" />
                                New Submission
                            </h3>
                            <form onSubmit={handleCreateSubmission} className="space-y-4">
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="radio"
                                            name="submissionType"
                                            value="LINK"
                                            checked={newSubmission.submission_type === 'LINK'}
                                            onChange={() => setNewSubmission({ ...newSubmission, submission_type: 'LINK' })}
                                            className="text-emerald-500 focus:ring-emerald-500"
                                        />
                                        External Link
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="radio"
                                            name="submissionType"
                                            value="FILE"
                                            checked={newSubmission.submission_type === 'FILE'}
                                            onChange={() => setNewSubmission({ ...newSubmission, submission_type: 'FILE' })}
                                            className="text-emerald-500 focus:ring-emerald-500"
                                        />
                                        File Upload
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newSubmission.title ?? ''}
                                            onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
                                            placeholder="e.g. Phase 1 Report, Github Repo"
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            {newSubmission.submission_type === 'LINK' ? 'Link' : 'File'}
                                        </label>
                                        {newSubmission.submission_type === 'LINK' ? (
                                            <input
                                                type="url"
                                                required
                                                value={newSubmission.link ?? ''}
                                                onChange={(e) => setNewSubmission({ ...newSubmission, link: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            />
                                        ) : (
                                            <input
                                                type="file"
                                                required
                                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Description (Optional)</label>
                                    <textarea
                                        value={newSubmission.description ?? ''}
                                        onChange={(e) => setNewSubmission({ ...newSubmission, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 rounded-xl bg-emerald-500 text-gray-900 dark:text-white font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Work'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Submission List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-1">Past Submissions</h3>
                            {submissions.length === 0 ? (
                                <div className="text-center py-12 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                    <LinkIcon className="w-12 h-12 text-white/10 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                                </div>
                            ) : (
                                submissions.map((submission) => (
                                    <div key={submission.id} className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-lg font-medium text-white">{submission.title}</h4>
                                                    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 font-medium ${submission.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        submission.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-amber-500/10 text-amber-400'
                                                        }`}>
                                                        {submission.status.charAt(0) + submission.status.slice(1).toLowerCase()}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(submission.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {submission.description && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{submission.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        Submitted by {submission.student?.name || 'Unknown'}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10">
                                                        {submission.submission_type === 'FILE' ? 'File Upload' : 'External Link'}
                                                    </span>
                                                </div>
                                            </div>
                                            <a
                                                href={submission.submission_type === 'FILE' ? submission.fileUrl || '#' : submission.link || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all ml-4"
                                                download={submission.submission_type === 'FILE'}
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

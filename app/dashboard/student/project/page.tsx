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
    TrendingUp,
    Link as LinkIcon,
    Plus,
    Clock,
    ExternalLink
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

interface Submission {
    id: number;
    title: string;
    description: string | null;
    link: string;
    submission_type: string;
    created_at: string;
    student: {
        name: string;
    };
}

export default function StudentProjectPage() {
    const [group, setGroup] = useState<GroupData | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'submissions'>('overview');

    // Submission Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSubmission, setNewSubmission] = useState({
        title: '',
        link: '',
        description: ''
    });

    useEffect(() => {
        fetchGroup();
        fetchSubmissions();
    }, []);

    const fetchGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/group', {
                headers: { 'Authorization': `Bearer ${token}` }
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

    const fetchSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/submissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        }
    };

    const handleCreateSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/submissions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSubmission)
            });

            if (response.ok) {
                setNewSubmission({ title: '', link: '', description: '' });
                fetchSubmissions();
                // Optionally show success message
            }
        } catch (error) {
            console.error('Error creating submission:', error);
        } finally {
            setIsSubmitting(false);
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

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'overview'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'text-white/50 hover:text-white'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'submissions'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'text-white/50 hover:text-white'
                            }`}
                    >
                        Submissions
                    </button>
                </div>

                {activeTab === 'overview' ? (
                    <>
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
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* Create Submission */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-400" />
                                New Submission
                            </h3>
                            <form onSubmit={handleCreateSubmission} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newSubmission.title}
                                            onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
                                            placeholder="e.g. Phase 1 Report, Github Repo"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Link</label>
                                        <input
                                            type="url"
                                            required
                                            value={newSubmission.link}
                                            onChange={(e) => setNewSubmission({ ...newSubmission, link: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Description (Optional)</label>
                                    <textarea
                                        value={newSubmission.description}
                                        onChange={(e) => setNewSubmission({ ...newSubmission, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Work'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Submission List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white px-1">Past Submissions</h3>
                            {submissions.length === 0 ? (
                                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <LinkIcon className="w-12 h-12 text-white/10 mx-auto mb-3" />
                                    <p className="text-white/40">No submissions yet</p>
                                </div>
                            ) : (
                                submissions.map((submission) => (
                                    <div key={submission.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-lg font-medium text-white">{submission.title}</h4>
                                                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(submission.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {submission.description && (
                                                    <p className="text-white/60 text-sm mb-3">{submission.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-white/40">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        Submitted by {submission.student?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                            <a
                                                href={submission.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
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

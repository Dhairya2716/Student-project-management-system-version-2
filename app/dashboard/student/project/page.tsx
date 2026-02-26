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
    link: string | null;
    fileUrl: string | null;
    submission_type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
        description: '',
        submission_type: 'LINK'
    });
    const [file, setFile] = useState<File | null>(null);

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
            const token = localStorage.getItem('token');
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
                    'Authorization': `Bearer ${token}`,
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

    return (
        <StudentLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Details</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your project information and progress</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'overview'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'submissions'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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

                        {/* Project Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Team Members</p>
                                <p className="text-3xl font-bold text-white">{group.memberCount}</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-cyan-400" />
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Meetings</p>
                                <p className="text-3xl font-bold text-white">{group.meetingCount}</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Upcoming Meetings</p>
                                <p className="text-3xl font-bold text-white">{group.upcomingMeetings}</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <Award className="w-6 h-6 text-amber-400" />
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Average CPI</p>
                                <p className="text-3xl font-bold text-white">
                                    {group.average_cpi ? group.average_cpi.toFixed(2) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Project Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project ID</p>
                                        <p className="text-gray-900 dark:text-white font-medium">#{group.id}</p>
                                    </div>
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
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Position</p>
                                        <p className="text-gray-900 dark:text-white font-medium">
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
                ) : (
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
                                            value={newSubmission.title}
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
                                                value={newSubmission.link}
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
                                        value={newSubmission.description}
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

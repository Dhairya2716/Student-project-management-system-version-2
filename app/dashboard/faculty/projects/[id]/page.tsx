'use client';

import { useEffect, useState, use } from 'react';
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
    Clock,
    ExternalLink,
    Mail,
    Phone
} from 'lucide-react';

interface ProjectGroup {
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
    project_group_member: Array<{
        student: {
            id: number;
            name: string;
            enrollment_no: string;
            email: string;
            phone: string | null;
            department: { name: string; code: string };
            batch: { name: string };
        };
        is_leader: boolean;
    }>;
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
        enrollment_no: string;
    };
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = useState<ProjectGroup | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'submissions'>('overview');

    useEffect(() => {
        if (id) {
            fetchProjectDetails();
            fetchSubmissions();
        }
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/faculty/projects/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProject(data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/faculty/projects/${id}/submissions`, {
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

    const handleUpdateSubmissionStatus = async (submissionId: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/faculty/projects/${id}/submissions/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Instantly update local state to avoid refetching everything
                setSubmissions(submissions.map(sub =>
                    sub.id === submissionId ? { ...sub, status } : sub
                ));
            }
        } catch (error) {
            console.error('Error updating submission status:', error);
            alert('Failed to update submission status');
        }
    };

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            </>
        );
    }

    if (error || !project) {
        return (
            <>
                <div className="p-8">
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <AlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
                        <p className="text-white/40">The requested project could not be found.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Project Details</h1>
                    <p className="text-white/50">Details and submissions for {project.name}</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'overview'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'text-white/50 hover:text-white'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'submissions'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'text-white/50 hover:text-white'
                            }`}
                    >
                        Submissions
                    </button>
                </div>

                {activeTab === 'overview' ? (
                    <div className="space-y-6">
                        {/* Project Header */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center flex-shrink-0">
                                    <FolderKanban className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                                    <p className="text-lg text-white/80 mb-3">{project.title}</p>
                                    {project.project_type && (
                                        <span className="inline-block px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {project.project_type.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {project.description && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-white/60" />
                                        <span className="text-sm font-medium text-white/70">Description</span>
                                    </div>
                                    <p className="text-white/80">{project.description}</p>
                                </div>
                            )}

                            {project.area && (
                                <div className="flex items-center gap-2 mt-4 text-white/70">
                                    <Building className="w-4 h-4" />
                                    <span className="text-sm">Project Area: <span className="font-medium text-white">{project.area}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Members List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {project.project_group_member.map((member) => (
                                <div key={member.student.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                                        {member.student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-white">{member.student.name}</h3>
                                            {member.is_leader && (
                                                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30">Leader</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/40">{member.student.enrollment_no}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                <span>{member.student.email}</span>
                                            </div>
                                            {member.student.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{member.student.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Submission List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white px-1">Submitted Work</h3>
                            {submissions.length === 0 ? (
                                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/10">
                                    <LinkIcon className="w-12 h-12 text-white/10 mx-auto mb-3" />
                                    <p className="text-white/40">No submissions from this group yet</p>
                                </div>
                            ) : (
                                submissions.map((submission) => (
                                    <div key={submission.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all">
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
                                                        Submitted by <span className="text-purple-400">{submission.student?.name}</span> ({submission.student?.enrollment_no})
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                                                        {submission.submission_type === 'FILE' ? 'File Upload' : 'External Link'}
                                                    </span>
                                                </div>
                                                {submission.status === 'PENDING' && (
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdateSubmissionStatus(submission.id, 'APPROVED')}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateSubmissionStatus(submission.id, 'REJECTED')}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <a
                                                href={submission.submission_type === 'FILE' ? (submission.fileUrl || '#') : (submission.link || '#')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
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
        </>
    );
}

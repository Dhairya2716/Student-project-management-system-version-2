'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Star, FileText, ExternalLink, Check, X, AlertCircle, Clock } from 'lucide-react';

interface Submission {
    id: number;
    title: string;
    description: string | null;
    link: string | null;
    fileUrl: string | null;
    submission_type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    student: { id: number; name: string };
    project_group: { id: number; name: string; title: string };
}

export default function EvaluationsPage() {
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const token = () => localStorage.getItem('token');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/faculty/submissions', {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubmissions(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (submissionId: number, status: 'APPROVED' | 'REJECTED') => {
        setActionLoading(submissionId);
        setMsg(null);
        try {
            const res = await fetch(`/api/faculty/submissions/${submissionId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setMsg({ type: 'success', text: `Submission ${status.toLowerCase()} successfully.` });
                fetchSubmissions();
            } else {
                const data = await res.json();
                setMsg({ type: 'error', text: data.error || 'Failed to update status.' });
            }
        } catch {
            setMsg({ type: 'error', text: 'An error occurred.' });
        } finally {
            setActionLoading(null);
        }
    };

    const pending = submissions.filter(s => s.status === 'PENDING');
    const completed = submissions.filter(s => s.status !== 'PENDING');
    const displayed = activeTab === 'pending' ? pending : completed;

    const statusBadge = (status: string) => {
        if (status === 'APPROVED') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (status === 'REJECTED') return 'bg-red-500/10 text-red-400 border-red-500/20';
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    };

    return (
        <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Evaluations</h1>
                    <p className="text-gray-500 dark:text-gray-400">Review and evaluate project submissions from your groups</p>
                </div>

                {msg && (
                    <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${msg.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20'
                        }`}>
                        {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {msg.text}
                        <button onClick={() => setMsg(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 rounded-lg transition-all font-medium text-sm ${activeTab === 'pending' ? 'bg-purple-500/20 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Pending Reviews
                        {pending.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">{pending.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 rounded-lg transition-all font-medium text-sm ${activeTab === 'completed' ? 'bg-purple-500/20 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Completed ({completed.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        {activeTab === 'pending'
                            ? <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            : <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        }
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">
                            {activeTab === 'pending' ? 'No pending evaluations' : 'No completed evaluations'}
                        </p>
                        <p className="text-gray-400 dark:text-gray-600 text-sm">
                            {activeTab === 'pending' ? 'Submission reviews will appear here' : 'Your evaluation history will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayed.map(sub => (
                            <div key={sub.id} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-purple-500/20 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sub.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${statusBadge(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(sub.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            Group: <span className="font-medium text-gray-700 dark:text-gray-300">{sub.project_group.name}</span>
                                            {' · '}By: <span className="font-medium text-gray-700 dark:text-gray-300">{sub.student.name}</span>
                                        </p>
                                        {sub.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{sub.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <a
                                            href={sub.link || sub.fileUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-purple-500 border border-gray-200 dark:border-white/10 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        {sub.status === 'PENDING' && (
                                            <>
                                                <button
                                                    disabled={actionLoading === sub.id}
                                                    onClick={() => handleAction(sub.id, 'APPROVED')}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                                <button
                                                    disabled={actionLoading === sub.id}
                                                    onClick={() => handleAction(sub.id, 'REJECTED')}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Evaluation Guidelines</h3>
                    <ul className="space-y-2 text-gray-500 dark:text-gray-400 text-sm">
                        {[
                            'Evaluate projects based on innovation, implementation quality, and presentation',
                            'Provide constructive feedback to help students improve',
                            'Complete evaluations within the specified deadline',
                            'Consider team collaboration and individual contributions'
                        ].map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
    );
}

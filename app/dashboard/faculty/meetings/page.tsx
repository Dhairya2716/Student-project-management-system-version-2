'use client';

import { useEffect, useState } from 'react';
import FacultyLayout from '@/components/FacultyLayout';
import { Calendar, Clock, MapPin, Users, Plus, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Meeting {
    id: number;
    meeting_datetime: string;
    purpose: string | null;
    location: string | null;
    notes: string | null;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    project_group: {
        name: string;
        title: string;
        project_group_member: Array<{
            student: {
                id: number;
                name: string;
                enrollment_no: string;
            };
        }>;
    };
    project_meeting_attendance: Array<{
        student: {
            id: number;
            name: string;
        };
        is_present: boolean;
    }>;
}

interface Group {
    id: number;
    name: string;
    title: string;
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        group_id: '',
        meeting_datetime: '',
        purpose: '',
        location: '',
        notes: ''
    });

    useEffect(() => {
        fetchMeetings();
        fetchGroups();
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/faculty/meetings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMeetings(data);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/faculty/groups', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(data.filter((g: any) => g.facultyRole === 'Guide'));
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/faculty/meetings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowCreateModal(false);
                setFormData({
                    group_id: '',
                    meeting_datetime: '',
                    purpose: '',
                    location: '',
                    notes: ''
                });
                fetchMeetings();
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'CANCELLED':
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-cyan-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        }
    };

    if (loading) {
        return (
            <FacultyLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            </FacultyLayout>
        );
    }

    return (
        <FacultyLayout>
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Meetings</h1>
                        <p className="text-white/40">Schedule and manage project meetings</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Schedule Meeting
                    </button>
                </div>

                {meetings.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg mb-4">No meetings scheduled</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                        >
                            Schedule Your First Meeting
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {meetings.map((meeting) => (
                            <div key={meeting.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-white">{meeting.project_group.name}</h3>
                                            <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(meeting.status)}`}>
                                                {getStatusIcon(meeting.status)}
                                                {meeting.status}
                                            </span>
                                        </div>
                                        <p className="text-white/60 text-sm">{meeting.project_group.title}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                        <div>
                                            <p className="text-xs text-white/40">Date & Time</p>
                                            <p className="text-sm text-white font-medium">
                                                {new Date(meeting.meeting_datetime).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {meeting.location && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                            <MapPin className="w-5 h-5 text-cyan-400" />
                                            <div>
                                                <p className="text-xs text-white/40">Location</p>
                                                <p className="text-sm text-white font-medium">{meeting.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <Users className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <p className="text-xs text-white/40">Participants</p>
                                            <p className="text-sm text-white font-medium">
                                                {meeting.project_group.project_group_member.length} students
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {meeting.purpose && (
                                    <div className="mb-4">
                                        <p className="text-xs text-white/40 mb-1">Purpose</p>
                                        <p className="text-sm text-white/80">{meeting.purpose}</p>
                                    </div>
                                )}

                                {meeting.notes && (
                                    <div className="mb-4">
                                        <p className="text-xs text-white/40 mb-1">Notes</p>
                                        <p className="text-sm text-white/60">{meeting.notes}</p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 transition-all text-sm">
                                        View Details
                                    </button>
                                    {meeting.status === 'SCHEDULED' && (
                                        <>
                                            <button className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all text-sm">
                                                Mark Complete
                                            </button>
                                            <button className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all text-sm">
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-2xl p-8 rounded-2xl bg-[#0a0a0f] border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Schedule New Meeting</h2>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-white/5 transition-all">
                                    <X className="w-5 h-5 text-white/50" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateMeeting} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Project Group</label>
                                    <select
                                        required
                                        value={formData.group_id}
                                        onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    >
                                        <option value="">Select a group</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>{group.name} - {group.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.meeting_datetime}
                                        onChange={(e) => setFormData({ ...formData, meeting_datetime: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Purpose</label>
                                    <input
                                        type="text"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        placeholder="e.g., Progress Review, Design Discussion"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Room 301, Online (Zoom)"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Additional notes or agenda items..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                    >
                                        Schedule Meeting
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-3 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
}

'use client';

import { useEffect, useState } from 'react';
import FacultyLayout from '@/components/FacultyLayout';
import { Calendar, Clock, MapPin, Users, Plus, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Meeting {
    id: number;
    meeting_datetime: string;
    duration: number | null;
    purpose: string | null;
    location: string | null;
    meeting_link: string | null;
    agenda: string | null;
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
    facultyRole: string;
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [attendanceData, setAttendanceData] = useState<{ [key: number]: { is_present: boolean, remarks: string } }>({});
    const [formData, setFormData] = useState({
        group_id: '',
        meeting_datetime: '',
        duration: '60', // Default 60 minutes
        purpose: '',
        location: '',
        meeting_link: '',
        agenda: '',
        notes: ''
    });

    useEffect(() => {
        fetchMeetings();
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedMeeting) {
            const initialAttendance: { [key: number]: { is_present: boolean, remarks: string } } = {};
            selectedMeeting.project_group.project_group_member.forEach(member => {
                const existingRecord = selectedMeeting.project_meeting_attendance.find(a => a.student.id === member.student.id);
                initialAttendance[member.student.id] = {
                    is_present: existingRecord ? existingRecord.is_present : false,
                    remarks: '' // Remarks not currently stored in frontend model but good for extensibility
                };
            });
            setAttendanceData(initialAttendance);
        }
    }, [selectedMeeting]);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/faculty/meetings', {
                cache: 'no-store',
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
                setGroups(data);
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
                    duration: '60',
                    purpose: '',
                    location: '',
                    meeting_link: '',
                    agenda: '',
                    notes: ''
                });
                fetchMeetings();
            } else {
                alert('Failed to create meeting');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            alert('Error creating meeting');
        }
    };

    const handleStatusUpdate = async (id: number, status: 'COMPLETED' | 'CANCELLED') => {
        if (!confirm(`Are you sure you want to mark this meeting as ${status}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/faculty/meetings/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchMeetings();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating meeting status:', error);
            alert('Error updating meeting status');
        }
    };

    const handleSaveDetails = async () => {
        if (!selectedMeeting) return;

        try {
            const token = localStorage.getItem('token');
            const attendance = Object.keys(attendanceData).map(studentId => ({
                student_id: parseInt(studentId),
                is_present: attendanceData[parseInt(studentId)].is_present,
                remarks: attendanceData[parseInt(studentId)].remarks
            }));

            const response = await fetch(`/api/faculty/meetings/${selectedMeeting.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    attendance
                })
            });

            if (response.ok) {
                setSelectedMeeting(null);
                fetchMeetings();
            } else {
                alert('Failed to save details');
            }
        } catch (error) {
            console.error('Error saving details:', error);
            alert('Error saving details');
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meetings</h1>
                        <p className="text-gray-500 dark:text-gray-400">Schedule and manage project meetings</p>
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
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No meetings scheduled</p>
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
                            <div key={meeting.id} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-white">{meeting.project_group.name}</h3>
                                            <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(meeting.status)}`}>
                                                {getStatusIcon(meeting.status)}
                                                {meeting.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{meeting.project_group.title}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                {new Date(meeting.meeting_datetime).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {meeting.duration && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                            <Clock className="w-5 h-5 text-violet-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{meeting.duration} minutes</p>
                                            </div>
                                        </div>
                                    )}
                                    {meeting.location && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                            <MapPin className="w-5 h-5 text-cyan-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{meeting.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <Users className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                {meeting.project_group.project_group_member.length} students
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {meeting.meeting_link && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Meeting Link</p>
                                        <a
                                            href={meeting.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-all text-sm"
                                        >
                                            Join Online Meeting →
                                        </a>
                                    </div>
                                )}

                                {meeting.purpose && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{meeting.purpose}</p>
                                    </div>
                                )}

                                {meeting.agenda && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Agenda</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{meeting.agenda}</p>
                                    </div>
                                )}

                                {meeting.notes && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{meeting.notes}</p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedMeeting(meeting)}
                                        className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 transition-all text-sm"
                                    >
                                        View Details
                                    </button>
                                    {meeting.status === 'SCHEDULED' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(meeting.id, 'COMPLETED')}
                                                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all text-sm"
                                            >
                                                Mark Complete
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(meeting.id, 'CANCELLED')}
                                                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all text-sm"
                                            >
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
                        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10">
                            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-white/10">
                                <h2 className="text-2xl font-bold text-white">Schedule New Meeting</h2>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:bg-white/5 transition-all">
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateMeeting} className="flex flex-col flex-1 overflow-hidden">
                                <div className="overflow-y-auto px-6 py-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Group</label>
                                        <select
                                            required
                                            value={formData.group_id}
                                            onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                        >
                                            <option value="">Select a group</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name} - {group.title} ({group.facultyRole})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={formData.meeting_datetime}
                                                onChange={(e) => setFormData({ ...formData, meeting_datetime: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                                            <input
                                                type="number"
                                                min="15"
                                                step="15"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                placeholder="60"
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purpose</label>
                                        <input
                                            type="text"
                                            value={formData.purpose}
                                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                            placeholder="e.g., Progress Review, Design Discussion"
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="e.g., Room 301, Lab 2"
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meeting Link (Optional)</label>
                                            <input
                                                type="url"
                                                value={formData.meeting_link}
                                                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                                                placeholder="https://zoom.us/j/..."
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agenda</label>
                                        <textarea
                                            value={formData.agenda}
                                            onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                            placeholder="Meeting agenda and discussion points..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Additional notes or agenda items..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                                        />
                                    </div>

                                </div>

                                <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-white/10">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                    >
                                        Schedule Meeting
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {selectedMeeting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10">
                            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-white/10">
                                <h2 className="text-2xl font-bold text-white">Meeting Details</h2>
                                <button onClick={() => setSelectedMeeting(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:bg-white/5 transition-all">
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{selectedMeeting.project_group.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedMeeting.project_group.title}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date & Time</p>
                                        <p className="text-gray-900 dark:text-white">
                                            {new Date(selectedMeeting.meeting_datetime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg border ${getStatusColor(selectedMeeting.status)}`}>
                                            {getStatusIcon(selectedMeeting.status)}
                                            {selectedMeeting.status}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance</h3>
                                    <div className="space-y-3">
                                        {selectedMeeting.project_group.project_group_member.map((member) => (
                                            <div key={member.student.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                                <div>
                                                    <p className="text-gray-900 dark:text-white font-medium">{member.student.name}</p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{member.student.enrollment_no}</p>
                                                </div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Present</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={attendanceData[member.student.id]?.is_present || false}
                                                        onChange={(e) => {
                                                            setAttendanceData(prev => ({
                                                                ...prev,
                                                                [member.student.id]: {
                                                                    ...prev[member.student.id],
                                                                    is_present: e.target.checked
                                                                }
                                                            }));
                                                        }}
                                                        className="w-5 h-5 rounded border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 text-purple-500 focus:ring-purple-500/50"
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-white/10">
                                <button
                                    onClick={handleSaveDetails}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setSelectedMeeting(null)}
                                    className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
}

'use client';

import { useEffect, useState } from 'react';
import {
    Calendar, Clock, MapPin, Users, Plus, X, CheckCircle, XCircle,
    AlertCircle, Trash2, ExternalLink, Loader2, Save, Filter
} from 'lucide-react';

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
            student: { id: number; name: string; enrollment_no: string };
        }>;
    };
    project_meeting_attendance: Array<{
        student: { id: number; name: string };
        is_present: boolean;
    }>;
}

interface Group { id: number; name: string; title: string; facultyRole: string; }

const STATUS_TABS = [
    { key: 'ALL', label: 'All' },
    { key: 'SCHEDULED', label: 'Upcoming' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
] as const;

const BLANK_FORM = {
    group_id: '', meeting_datetime: '', duration: '60',
    purpose: '', location: '', meeting_link: '', agenda: '', notes: ''
};

function statusStyle(status: string) {
    if (status === 'COMPLETED') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'CANCELLED') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
}
function statusIcon(status: string) {
    if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4" />;
    if (status === 'CANCELLED') return <XCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
}
function fmtDate(dt: string) {
    return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
function isUpcoming(dt: string) { return new Date(dt) > new Date(); }

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('ALL');
    const [showCreate, setShowCreate] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<number, { is_present: boolean }>>({});
    const [formData, setFormData] = useState(BLANK_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    const token = () => localStorage.getItem('token');

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        if (!selectedMeeting) return;
        const init: Record<number, { is_present: boolean }> = {};
        selectedMeeting.project_group.project_group_member.forEach(m => {
            const rec = selectedMeeting.project_meeting_attendance.find(a => a.student.id === m.student.id);
            init[m.student.id] = { is_present: rec?.is_present ?? false };
        });
        setAttendanceData(init);
    }, [selectedMeeting]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [mr, gr] = await Promise.all([
                fetch('/api/faculty/meetings', { headers: { Authorization: `Bearer ${token()}` } }),
                fetch('/api/faculty/groups', { headers: { Authorization: `Bearer ${token()}` } })
            ]);
            if (mr.ok) setMeetings(await mr.json());
            if (gr.ok) setGroups(await gr.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/faculty/meetings', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) { setShowCreate(false); setFormData(BLANK_FORM); fetchAll(); }
            else alert('Failed to schedule meeting');
        } finally { setSubmitting(false); }
    };

    const handleStatusUpdate = async (id: number, status: 'COMPLETED' | 'CANCELLED') => {
        if (!confirm(`Mark this meeting as ${status}?`)) return;
        await fetch(`/api/faculty/meetings/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchAll();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this meeting permanently?')) return;
        await fetch(`/api/faculty/meetings/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token()}` }
        });
        fetchAll();
    };

    const handleSaveAttendance = async () => {
        if (!selectedMeeting) return;
        setSavingAttendance(true);
        const attendance = Object.entries(attendanceData).map(([sid, v]) => ({
            student_id: parseInt(sid), is_present: v.is_present, remarks: ''
        }));
        const res = await fetch(`/api/faculty/meetings/${selectedMeeting.id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendance })
        });
        setSavingAttendance(false);
        if (res.ok) { setSelectedMeeting(null); fetchAll(); }
        else alert('Failed to save attendance');
    };

    const filtered = meetings.filter(m => tab === 'ALL' || m.status === tab);
    const upcoming = meetings.filter(m => m.status === 'SCHEDULED' && isUpcoming(m.meeting_datetime)).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            </div>
        );
    }

    return (
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Meetings</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Schedule, track attendance and manage project meetings</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm">
                        <Plus className="w-4 h-4" /> Schedule Meeting
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total', value: meetings.length, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                        { label: 'Upcoming', value: upcoming, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                        { label: 'Completed', value: meetings.filter(m => m.status === 'COMPLETED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        { label: 'Cancelled', value: meetings.filter(m => m.status === 'CANCELLED').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                    ].map(s => (
                        <div key={s.label} className={`p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 flex items-center gap-3`}>
                            <div className={`w-10 h-10 rounded-xl ${s.bg} border flex items-center justify-center`}>
                                <Calendar className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl w-fit">
                    {STATUS_TABS.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key
                                ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            {t.label}
                            <span className="ml-1.5 text-xs opacity-60">
                                {t.key === 'ALL' ? meetings.length : meetings.filter(m => m.status === t.key).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Meetings List */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <Calendar className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 dark:text-gray-500 mb-4">
                            {tab === 'ALL' ? 'No meetings yet' : `No ${tab.toLowerCase()} meetings`}
                        </p>
                        {tab !== 'CANCELLED' && (
                            <button onClick={() => setShowCreate(true)}
                                className="px-5 py-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all text-sm">
                                Schedule a Meeting
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(meeting => {
                            const attendedCount = meeting.project_meeting_attendance.filter(a => a.is_present).length;
                            const totalCount = meeting.project_group.project_group_member.length;
                            return (
                                <div key={meeting.id} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all group">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.project_group.name}</h3>
                                                <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${statusStyle(meeting.status)}`}>
                                                    {statusIcon(meeting.status)} {meeting.status}
                                                </span>
                                                {meeting.status === 'SCHEDULED' && isUpcoming(meeting.meeting_datetime) && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">UPCOMING</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{meeting.project_group.title}</p>
                                            {meeting.purpose && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{meeting.purpose}"</p>}
                                        </div>
                                        <button onClick={() => handleDelete(meeting.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all ml-4">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Info chips */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4 text-purple-400" />
                                            {fmtDate(meeting.meeting_datetime)}
                                        </div>
                                        {meeting.duration && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <Clock className="w-4 h-4 text-violet-400" />
                                                {meeting.duration} min
                                            </div>
                                        )}
                                        {meeting.location && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-4 h-4 text-cyan-400" />
                                                {meeting.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                            <Users className="w-4 h-4 text-emerald-400" />
                                            {attendedCount}/{totalCount} attended
                                        </div>
                                    </div>

                                    {meeting.agenda && (
                                        <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                                            <p className="text-xs text-gray-400 mb-1">Agenda</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-2">{meeting.agenda}</p>
                                        </div>
                                    )}

                                    {/* Action row */}
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => setSelectedMeeting(meeting)}
                                            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all">
                                            <Users className="w-4 h-4" /> Attendance
                                        </button>
                                        {meeting.meeting_link && (
                                            <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                                                <ExternalLink className="w-4 h-4" /> Join
                                            </a>
                                        )}
                                        {meeting.status === 'SCHEDULED' && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(meeting.id, 'COMPLETED')}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all">
                                                    <CheckCircle className="w-4 h-4" /> Mark Complete
                                                </button>
                                                <button onClick={() => handleStatusUpdate(meeting.id, 'CANCELLED')}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                                                    <XCircle className="w-4 h-4" /> Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Create Meeting Modal */}
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#0d0d18] border border-gray-200 dark:border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule New Meeting</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">Fill in the details to schedule a meeting</p>
                                </div>
                                <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
                                <div className="overflow-y-auto px-6 py-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Group *</label>
                                        <select required value={formData.group_id} onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all">
                                            <option value="">Select a group...</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.name} — {g.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date & Time *</label>
                                            <input type="datetime-local" required value={formData.meeting_datetime}
                                                onChange={e => setFormData({ ...formData, meeting_datetime: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (min)</label>
                                            <input type="number" min="15" step="15" value={formData.duration}
                                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Purpose</label>
                                        <input type="text" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                            placeholder="e.g., Progress Review, Design Discussion"
                                            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 text-sm transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                                            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="e.g., Room 301, Lab 2"
                                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 text-sm transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Meeting Link</label>
                                            <input type="url" value={formData.meeting_link} onChange={e => setFormData({ ...formData, meeting_link: e.target.value })}
                                                placeholder="https://meet.google.com/..."
                                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 text-sm transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Agenda</label>
                                        <textarea value={formData.agenda} onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                                            placeholder="Meeting agenda and discussion points..." rows={3}
                                            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 text-sm transition-all resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                                        <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Additional notes..." rows={2}
                                            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 text-sm transition-all resize-none" />
                                    </div>
                                </div>
                                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06]">
                                    <button type="submit" disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                        Schedule Meeting
                                    </button>
                                    <button type="button" onClick={() => setShowCreate(false)}
                                        className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Attendance Modal */}
                {selectedMeeting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-[#0d0d18] border border-gray-200 dark:border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Attendance</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">{selectedMeeting.project_group.name} · {fmtDate(selectedMeeting.meeting_datetime)}</p>
                                </div>
                                <button onClick={() => setSelectedMeeting(null)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                                {selectedMeeting.project_group.project_group_member.map(m => (
                                    <div key={m.student.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-purple-500/20 transition-all">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{m.student.name}</p>
                                            <p className="text-xs text-gray-400">{m.student.enrollment_no}</p>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className={`text-xs font-medium ${attendanceData[m.student.id]?.is_present ? 'text-emerald-400' : 'text-gray-400'}`}>
                                                {attendanceData[m.student.id]?.is_present ? 'Present' : 'Absent'}
                                            </span>
                                            <div className="relative">
                                                <input type="checkbox"
                                                    checked={attendanceData[m.student.id]?.is_present ?? false}
                                                    onChange={e => setAttendanceData(prev => ({ ...prev, [m.student.id]: { is_present: e.target.checked } }))}
                                                    className="sr-only peer" />
                                                <div className="w-10 h-5 rounded-full bg-gray-200 dark:bg-white/10 peer-checked:bg-emerald-500 transition-colors" />
                                                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                                            </div>
                                        </label>
                                    </div>
                                ))}
                                <div className="mt-2 px-1 text-xs text-gray-400">
                                    {Object.values(attendanceData).filter(v => v.is_present).length} / {selectedMeeting.project_group.project_group_member.length} present
                                </div>
                            </div>
                            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06]">
                                <button onClick={handleSaveAttendance} disabled={savingAttendance}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium transition-all disabled:opacity-50">
                                    {savingAttendance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Attendance
                                </button>
                                <button onClick={() => setSelectedMeeting(null)}
                                    className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

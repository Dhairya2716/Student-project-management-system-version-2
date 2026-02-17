'use client';

import { useEffect, useState } from 'react';
import StudentLayout from '@/components/StudentLayout';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText
} from 'lucide-react';

interface Meeting {
    id: number;
    meeting_datetime: string;
    purpose: string | null;
    location: string | null;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    notes: string | null;
    staff: { id: number; name: string; email: string } | null;
    project_group: { id: number; name: string; title: string } | null;
    myAttendance: {
        is_present: boolean;
        remarks: string | null;
    } | null;
}

export default function StudentMeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        fetchMeetings();

        // Poll for new meetings every 5 seconds
        const intervalId = setInterval(fetchMeetings, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/meetings', {
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

    const filteredMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.meeting_datetime);
        const now = new Date();

        if (filter === 'upcoming') {
            return meetingDate > now && meeting.status === 'SCHEDULED';
        } else if (filter === 'past') {
            return meetingDate < now || meeting.status !== 'SCHEDULED';
        }
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            case 'COMPLETED':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-white/10 text-white/40 border-white/20';
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
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

    return (
        <StudentLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Meetings</h1>
                    <p className="text-white/50">View your project meetings and attendance</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-6 w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-emerald-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        All Meetings
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg transition-all ${filter === 'upcoming' ? 'bg-emerald-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg transition-all ${filter === 'past' ? 'bg-emerald-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        Past
                    </button>
                </div>

                {/* Meetings List */}
                {filteredMeetings.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg">No meetings found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMeetings.map((meeting) => {
                            const { date, time } = formatDateTime(meeting.meeting_datetime);
                            const isPast = new Date(meeting.meeting_datetime) < new Date();

                            return (
                                <div key={meeting.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {meeting.purpose || 'Project Meeting'}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusBadge(meeting.status)}`}>
                                                    {meeting.status}
                                                </span>
                                            </div>
                                            {meeting.project_group && (
                                                <p className="text-sm text-white/40 mb-3">{meeting.project_group.name}</p>
                                            )}
                                        </div>
                                        {meeting.myAttendance && (
                                            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${meeting.myAttendance.is_present ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {meeting.myAttendance.is_present ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Present</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Absent</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                            <Calendar className="w-5 h-5 text-cyan-400" />
                                            <div>
                                                <p className="text-xs text-white/40">Date</p>
                                                <p className="text-sm font-medium text-white">{date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                            <Clock className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="text-xs text-white/40">Time</p>
                                                <p className="text-sm font-medium text-white">{time}</p>
                                            </div>
                                        </div>
                                        {meeting.location && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                                <MapPin className="w-5 h-5 text-emerald-400" />
                                                <div>
                                                    <p className="text-xs text-white/40">Location</p>
                                                    <p className="text-sm font-medium text-white">{meeting.location}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {meeting.staff && (
                                        <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
                                            <User className="w-4 h-4" />
                                            <span>Conducted by: {meeting.staff.name}</span>
                                        </div>
                                    )}

                                    {meeting.notes && (
                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 mt-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-white/40" />
                                                <span className="text-sm font-medium text-white/60">Notes</span>
                                            </div>
                                            <p className="text-sm text-white/50">{meeting.notes}</p>
                                        </div>
                                    )}

                                    {meeting.myAttendance?.remarks && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                                <span className="text-sm font-medium text-amber-400">Remarks</span>
                                            </div>
                                            <p className="text-sm text-white/60">{meeting.myAttendance.remarks}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

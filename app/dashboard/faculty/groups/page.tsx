'use client';

import { useEffect, useState } from 'react';
import FacultyLayout from '@/components/FacultyLayout';
import { Users, Calendar, TrendingUp, Filter, Search, ExternalLink } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    email: string;
    enrollment_no: string;
    department: {
        name: string;
        code: string;
    };
}

interface Group {
    id: number;
    name: string;
    title: string;
    area: string | null;
    description: string | null;
    average_cpi: number | null;
    facultyRole: string;
    memberCount: number;
    meetingCount: number;
    upcomingMeetings: number;
    project_type: {
        name: string;
    } | null;
    project_group_member: Array<{
        is_leader: boolean;
        cgpa: number | null;
        student: Student;
    }>;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = groups.filter(group => {
        const matchesFilter = filter === 'all' || group.facultyRole.toLowerCase() === filter.toLowerCase();
        const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Groups</h1>
                    <p className="text-white/40">Manage and monitor your assigned project groups</p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-purple-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('guide')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'guide' ? 'bg-purple-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            Guide
                        </button>
                        <button
                            onClick={() => setFilter('convener')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'convener' ? 'bg-purple-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            Convener
                        </button>
                        <button
                            onClick={() => setFilter('expert')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'expert' ? 'bg-purple-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            Expert
                        </button>
                    </div>
                </div>

                {filteredGroups.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg">No groups found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredGroups.map((group) => (
                            <div key={group.id} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                                            <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                {group.facultyRole}
                                            </span>
                                        </div>
                                        <p className="text-white/60 text-sm mb-2">{group.title}</p>
                                        {group.project_type && (
                                            <span className="inline-block px-2 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                {group.project_type.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {group.description && (
                                    <p className="text-white/40 text-sm mb-4 line-clamp-2">{group.description}</p>
                                )}

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-purple-400" />
                                            <span className="text-xs text-white/40">Members</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{group.memberCount}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs text-white/40">Meetings</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{group.meetingCount}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs text-white/40">Upcoming</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{group.upcomingMeetings}</p>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-xs text-white/40 mb-2">Team Members</p>
                                    <div className="space-y-2">
                                        {group.project_group_member.slice(0, 3).map((member) => (
                                            <div key={member.student.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">{member.student.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{member.student.name}</p>
                                                        <p className="text-white/40 text-xs">{member.student.enrollment_no}</p>
                                                    </div>
                                                </div>
                                                {member.is_leader && (
                                                    <span className="px-2 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        Leader
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {group.project_group_member.length > 3 && (
                                            <p className="text-xs text-white/40 text-center">
                                                +{group.project_group_member.length - 3} more members
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 transition-all">
                                        View Details
                                    </button>
                                    <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
}

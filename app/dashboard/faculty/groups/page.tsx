'use client';

'use client';

import { useEffect, useState } from 'react';
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
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Groups</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and monitor your assigned project groups</p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('guide')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'guide' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Guide
                        </button>
                        <button
                            onClick={() => setFilter('convener')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'convener' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Convener
                        </button>
                        <button
                            onClick={() => setFilter('expert')}
                            className={`px-4 py-2 rounded-lg transition-all ${filter === 'expert' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Expert
                        </button>
                    </div>
                </div>

                {filteredGroups.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-200 dark:border-white/10">
                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No groups found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredGroups.map((group) => (
                            <div key={group.id} className="group p-6 rounded-2xl bg-white dark:bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all shadow-sm hover:shadow-lg">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                                            <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                                                {group.facultyRole}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{group.title}</p>
                                        {group.project_type && (
                                            <span className="inline-block px-2 py-1 text-xs rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                                                {group.project_type.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {group.description && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>
                                )}

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-200 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Members</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{group.memberCount}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-200 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Meetings</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{group.meetingCount}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-200 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Upcoming</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{group.upcomingMeetings}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-200 dark:border-white/10 pt-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Team Members</p>
                                    <div className="space-y-2">
                                        {group.project_group_member.slice(0, 3).map((member) => (
                                            <div key={member.student.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center"><span className="text-white text-xs font-bold">{member.student.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 dark:text-white font-medium">{member.student.name}</p>
                                                        <p className="text-gray-400 dark:text-gray-500 text-xs">{member.student.enrollment_no}</p>
                                                    </div>
                                                </div>
                                                {member.is_leader && (
                                                    <span className="px-2 py-1 text-xs rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                        Leader
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {group.project_group_member.length > 3 && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                                +{group.project_group_member.length - 3} more members
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 transition-all">
                                        View Details
                                    </button>
                                    <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-200 dark:border-white/10 transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
    );
}

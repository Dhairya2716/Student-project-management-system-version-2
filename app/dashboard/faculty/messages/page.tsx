'use client';

import { useState, useEffect } from 'react';
import GroupChat from '@/components/GroupChat';
import { MessageSquare, Search, Loader2, Users } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    title: string;
    memberCount: number;
    project_group_member: { is_leader: boolean; student: { id: number; name: string } }[];
}

export default function MessagesPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            setCurrentUser({ id: u.id, role: u.role });
        }

        const token = localStorage.getItem('token');
        fetch('/api/faculty/groups', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setGroups(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
            <div className="p-8 flex flex-col" style={{ height: 'calc(100vh - 73px)' }}>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Messages</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Communicate with your project groups</p>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    {/* Group sidebar */}
                    <div className="lg:col-span-1 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 flex flex-col min-h-0">
                        <div className="p-4 border-b border-gray-100 dark:border-white/[0.06]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 text-sm transition-all" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.04]">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 text-purple-400 animate-spin" /></div>
                            ) : filtered.length === 0 ? (
                                <div className="py-10 text-center">
                                    <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No groups found</p>
                                </div>
                            ) : filtered.map(g => {
                                const leader = g.project_group_member?.find(m => m.is_leader);
                                const isSelected = selectedGroup?.id === g.id;
                                return (
                                    <button key={g.id} onClick={() => setSelectedGroup(g)}
                                        className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors ${isSelected ? 'bg-purple-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'}`}>
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {g.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm truncate ${isSelected ? 'text-purple-400' : 'text-gray-900 dark:text-white'}`}>{g.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{g.title}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{g.project_group_member?.length || 0} members{leader ? ` · ${leader.student.name}` : ''}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className="lg:col-span-2 min-h-0">
                        {!selectedGroup || !currentUser ? (
                            <div className="h-full flex items-center justify-center rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <div className="text-center">
                                    <MessageSquare className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">No conversation selected</p>
                                    <p className="text-sm text-gray-300 dark:text-gray-600">Select a group from the left to start messaging</p>
                                </div>
                            </div>
                        ) : (
                            <GroupChat
                                key={selectedGroup.id}
                                groupId={selectedGroup.id}
                                groupName={selectedGroup.name}
                                groupTitle={selectedGroup.title}
                                currentUserId={currentUser.id}
                                currentUserRole={currentUser.role}
                                accentColor="purple"
                            />
                        )}
                    </div>
                </div>
            </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import GroupChat from '@/components/GroupChat';
import { MessageSquare, Search, Loader2, Users, FolderKanban } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    title: string;
    status: string;
    project_group_member: { student: { id: number; name: string } }[];
    staff_project_group_guide_idTostaff: { id: number; name: string } | null;
}

export default function AdminMessagesPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));

        fetch('/api/admin/projects')
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
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monitor and participate in group conversations</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 220px)' }}>
                {/* Group sidebar */}
                <div className="lg:col-span-1 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 flex flex-col min-h-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-white/[0.06]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search groups..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm transition-all" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.04]">
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 text-orange-400 animate-spin" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="py-10 text-center">
                                <FolderKanban className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No groups found</p>
                            </div>
                        ) : filtered.map(g => {
                            const isSelected = selectedGroup?.id === g.id;
                            return (
                                <button key={g.id} onClick={() => setSelectedGroup(g)}
                                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors ${isSelected ? 'bg-orange-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'}`}>
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {g.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${isSelected ? 'text-orange-400' : 'text-gray-900 dark:text-white'}`}>{g.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{g.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-gray-400">{g.project_group_member?.length || 0} members</span>
                                            {g.staff_project_group_guide_idTostaff && (
                                                <span className="text-[11px] text-purple-400">· {g.staff_project_group_guide_idTostaff.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 ${g.status === 'APPROVED' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : g.status === 'REJECTED' ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                        {g.status}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Chat */}
                <div className="lg:col-span-2 min-h-0">
                    {!selectedGroup || !currentUser ? (
                        <div className="h-full flex items-center justify-center rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">Select a group</p>
                                <p className="text-sm text-gray-300 dark:text-gray-600">Choose a project group to view and participate in its chat</p>
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
                            accentColor="orange"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

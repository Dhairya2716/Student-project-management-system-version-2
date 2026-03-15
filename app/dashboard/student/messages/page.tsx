'use client';

import { useState, useEffect } from 'react';
import GroupChat from '@/components/GroupChat';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GroupInfo {
    id: number;
    name: string;
    title: string;
}

export default function StudentMessagesPage() {
    const [group, setGroup] = useState<GroupInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [noGroup, setNoGroup] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            setCurrentUser({ id: u.id, role: u.role });
        }

        const token = localStorage.getItem('token');
        fetch('/api/student/group', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => {
                if (!r.ok) { setNoGroup(true); return null; }
                return r.json();
            })
            .then(data => {
                if (data) setGroup({ id: data.id, name: data.name, title: data.title });
                else setNoGroup(true);
            })
            .catch(() => setNoGroup(true))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <div className="p-8 flex flex-col" style={{ height: 'calc(100vh - 73px)' }}>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Group Messages</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Chat with your project group and faculty guide</p>
                </div>

                <div className="flex-1 min-h-0">
                    {loading ? (
                        <div className="h-full flex items-center justify-center rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                        </div>
                    ) : noGroup || !group ? (
                        <div className="h-full flex items-center justify-center rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <div className="text-center px-6">
                                <AlertCircle className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Not in a Group</p>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">You need to be part of a project group to use group messaging.</p>
                                <Link href="/dashboard/student/team/create"
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:from-emerald-600 hover:to-teal-600 transition-all">
                                    Create or Join a Group
                                </Link>
                            </div>
                        </div>
                    ) : currentUser ? (
                        <GroupChat
                            key={group.id}
                            groupId={group.id}
                            groupName={group.name}
                            groupTitle={group.title}
                            currentUserId={currentUser.id}
                            currentUserRole={currentUser.role}
                            accentColor="emerald"
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
}

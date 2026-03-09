'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageSquare, Users, Clock } from 'lucide-react';

interface DbMessage {
    id: number;
    group_id: number;
    sender_id: number;
    sender_role: string;
    message: string;
    created_at: string;
    senderName: string;
}

interface GroupChatProps {
    groupId: number;
    groupName: string;
    groupTitle: string;
    currentUserId: number;
    currentUserRole: string;
    accentColor?: 'purple' | 'emerald' | 'orange';
}

const ACCENT = {
    purple: {
        bubble: 'bg-gradient-to-br from-purple-500 to-violet-500',
        send: 'bg-gradient-to-br from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600',
        focus: 'focus:border-purple-500/50',
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    emerald: {
        bubble: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        send: 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
        focus: 'focus:border-emerald-500/50',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    orange: {
        bubble: 'bg-gradient-to-br from-orange-500 to-red-500',
        send: 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
        focus: 'focus:border-orange-500/50',
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    }
};

function roleBadgeColor(role: string) {
    if (role === 'FACULTY') return 'text-purple-400';
    if (role === 'ADMIN') return 'text-red-400';
    return 'text-emerald-400';
}

function timeStr(dt: string) {
    return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function dateStr(dt: string) {
    const d = new Date(dt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function GroupChat({ groupId, groupName, groupTitle, currentUserId, currentUserRole, accentColor = 'purple' }: GroupChatProps) {
    const [messages, setMessages] = useState<DbMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const ac = ACCENT[accentColor];

    const token = () => localStorage.getItem('token');

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/messages?groupId=${groupId}`, {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        setLoading(true);
        setMessages([]);
        fetchMessages();
        const t = setInterval(fetchMessages, 5000); // poll every 5s
        return () => clearInterval(t);
    }, [fetchMessages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!draft.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, message: draft.trim() })
            });
            if (res.ok) {
                const msg = await res.json();
                setMessages(prev => [...prev, msg]);
                setDraft('');
            }
        } catch { /* silent */ } finally {
            setSending(false);
        }
    };

    // Group messages by date for separators
    const grouped: { date: string; msgs: DbMessage[] }[] = [];
    messages.forEach(m => {
        const d = dateStr(m.created_at);
        const last = grouped[grouped.length - 1];
        if (last && last.date === d) last.msgs.push(m);
        else grouped.push({ date: d, msgs: [m] });
    });

    return (
        <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${ac.bubble} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {groupName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{groupName}</p>
                    <p className="text-xs text-gray-400 truncate">{groupTitle}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>Group Chat</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 min-h-0">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-7 h-7 text-gray-300 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60 py-10">
                        <MessageSquare className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" />
                        <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    grouped.map(group => (
                        <div key={group.date}>
                            <div className="flex items-center gap-3 my-3">
                                <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
                                <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.06]">{group.date}</span>
                                <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
                            </div>
                            {group.msgs.map((msg, i) => {
                                const isMe = msg.sender_id === currentUserId && msg.sender_role === currentUserRole;
                                const prevSame = i > 0 && group.msgs[i - 1].sender_id === msg.sender_id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${prevSame ? 'mt-0.5' : 'mt-3'}`}>
                                        <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            {!isMe && !prevSame && (
                                                <div className="flex items-center gap-1.5 mb-1 ml-1">
                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{msg.senderName}</span>
                                                    <span className={`text-[10px] font-medium ${roleBadgeColor(msg.sender_role)}`}>({msg.sender_role})</span>
                                                </div>
                                            )}
                                            <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isMe
                                                ? `${ac.bubble} text-white rounded-br-sm`
                                                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white rounded-bl-sm'
                                                }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-0.5 mx-1">{timeStr(msg.created_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none ${ac.focus} text-sm transition-all`}
                    />
                    <button
                        onClick={send}
                        disabled={!draft.trim() || sending}
                        className={`p-2.5 rounded-xl text-white ${ac.send} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 flex items-center gap-1 ml-1">
                    <Clock className="w-3 h-3" /> Messages are visible to all group members and assigned faculty
                </p>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import FacultyLayout from '@/components/FacultyLayout';
import { MessageSquare, Send, Search, Users } from 'lucide-react';

export default function MessagesPage() {
    const [message, setMessage] = useState('');

    return (
        <FacultyLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
                    <p className="text-gray-500 dark:text-gray-400">Communicate with students and groups</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                    <div className="lg:col-span-1 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-4 flex flex-col">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 flex flex-col">
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No conversation selected</p>
                                <p className="text-gray-300 dark:text-gray-600 text-sm">Select a conversation to start messaging</p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                />
                                <button
                                    disabled
                                    className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-cyan-400 text-sm">
                        <strong>Coming Soon:</strong> Real-time messaging functionality will be available in the next update.
                    </p>
                </div>
            </div>
        </FacultyLayout>
    );
}

'use client';

import { Settings as SettingsIcon, Bell, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        meetings: true,
        evaluations: true
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your preferences and settings</p>
                </div>
            </div>

            <div className="max-w-4xl space-y-6">
                {/* Appearance Settings */}
                <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Appearance</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize how the app looks</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Theme</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-3 rounded-lg transition-all ${theme === 'light'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:bg-white/10'}`}
                                >
                                    <Sun className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-3 rounded-lg transition-all ${theme === 'dark'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:bg-white/10'}`}
                                >
                                    <Moon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Notifications</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your notification preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Push Notifications</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.push}
                                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Meeting Reminders</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about upcoming meetings</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.meetings}
                                    onChange={(e) => setNotifications({ ...notifications, meetings: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Evaluation Updates</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about evaluation deadlines</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.evaluations}
                                    onChange={(e) => setNotifications({ ...notifications, evaluations: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

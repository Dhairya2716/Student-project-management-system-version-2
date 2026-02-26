'use client';

import { useState } from 'react';
import FacultyLayout from '@/components/FacultyLayout';
import { ClipboardList, Star, FileText, Calendar, Users } from 'lucide-react';

export default function EvaluationsPage() {
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    return (
        <FacultyLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Evaluations</h1>
                    <p className="text-gray-500 dark:text-gray-400">Review and evaluate project submissions</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'pending' ? 'bg-purple-500/20 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Pending Reviews
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'completed' ? 'bg-purple-500/20 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Completed
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No pending evaluations</p>
                        <p className="text-gray-300 dark:text-gray-600 text-sm">Evaluation submissions will appear here</p>
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No completed evaluations</p>
                        <p className="text-gray-300 dark:text-gray-600 text-sm">Your evaluation history will appear here</p>
                    </div>
                )}

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Evaluation Guidelines</h3>
                    <ul className="space-y-2 text-gray-500 dark:text-gray-400 text-sm">
                        <li className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span>Evaluate projects based on innovation, implementation quality, and presentation</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span>Provide constructive feedback to help students improve</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span>Complete evaluations within the specified deadline</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span>Consider team collaboration and individual contributions</span>
                        </li>
                    </ul>
                </div>
            </div>
        </FacultyLayout>
    );
}

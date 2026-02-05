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
                    <h1 className="text-3xl font-bold text-white mb-2">Evaluations</h1>
                    <p className="text-white/40">Review and evaluate project submissions</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'pending' ? 'bg-purple-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        Pending Reviews
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'completed' ? 'bg-purple-500/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        Completed
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <ClipboardList className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg mb-2">No pending evaluations</p>
                        <p className="text-white/20 text-sm">Evaluation submissions will appear here</p>
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg mb-2">No completed evaluations</p>
                        <p className="text-white/20 text-sm">Your evaluation history will appear here</p>
                    </div>
                )}

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Evaluation Guidelines</h3>
                    <ul className="space-y-2 text-white/60 text-sm">
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

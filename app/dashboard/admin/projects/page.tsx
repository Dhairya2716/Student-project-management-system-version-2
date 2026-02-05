'use client';

import { useState, useEffect } from 'react';
import {
    FolderKanban,
    Search,
    Loader2,
    Users,
    Calendar,
    TrendingUp
} from 'lucide-react';

interface Project {
    id: number;
    name: string;
    description: string | null;
    project_group?: {
        name: string;
        student: { name: string }[];
        guide?: { name: string } | null;
    } | null;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/admin/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-white/50">View all student projects</p>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
                />
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/50">Loading projects...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
                    <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">{searchQuery ? 'No projects found' : 'No projects yet'}</p>
                    <p className="text-white/30 text-sm mt-2">Projects will appear here once groups create them</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                    <FolderKanban className="w-6 h-6 text-orange-400" />
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                    Active
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                            <p className="text-white/50 text-sm mb-4 line-clamp-2">
                                {project.description || 'No description provided'}
                            </p>
                            {project.project_group && (
                                <div className="space-y-2 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-sm text-white/50">
                                        <Users className="w-4 h-4" />
                                        <span>{project.project_group.name}</span>
                                        <span className="text-white/30">•</span>
                                        <span>{project.project_group.student?.length || 0} members</span>
                                    </div>
                                    {project.project_group.guide && (
                                        <div className="flex items-center gap-2 text-sm text-white/50">
                                            <span>Guide: {project.project_group.guide.name}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

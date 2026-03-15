'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FolderKanban,
    Users,
    Calendar,
    Award,
    Building,
    AlertCircle,
    Plus,
    Search,
    Filter,
    ArrowRight,
    Loader2,
    TrendingUp,
    Clock,
    ExternalLink
} from 'lucide-react';

interface Project {
    id: number;
    name: string;
    title: string;
    area: string | null;
    description: string | null;
    average_cpi: number | null;
    memberCount: number;
    completedMeetings: number;
    totalMeetings: number;
    progress: number;
    project_type: {
        name: string;
    } | null;
    project_group_member: Array<{
        student: {
            id: number;
            name: string;
            enrollment_no: string;
            department: {
                name: string;
                code: string;
            };
            batch: {
                name: string;
                start_year: number;
                end_year: number;
            };
        };
        is_leader: boolean;
    }>;
    staff_project_group_guide_idTostaff: {
        id: number;
        name: string;
    } | null;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/faculty/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || project.project_type?.name === filterType;
        return matchesSearch && matchesType;
    });

    const projectTypes = Array.from(new Set(projects.map(p => p.project_type?.name).filter(Boolean)));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monitor project progress and team performance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <FolderKanban className="w-5 h-5 text-purple-400" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Total Projects</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{projects.length}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">In Progress</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {projects.filter(p => p.progress > 0 && p.progress < 100).length}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Total Students</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {projects.reduce((sum, p) => sum + p.memberCount, 0)}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Total Meetings</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {projects.reduce((sum, p) => sum + p.totalMeetings, 0)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    >
                        <option value="all">All Types</option>
                        {projectTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                        <FolderKanban className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{project.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{project.title}</p>
                                        <div className="flex items-center gap-2">
                                            {project.project_type && (
                                                <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    {project.project_type.name}
                                                </span>
                                            )}
                                            {project.area && (
                                                <span className="px-2 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                    {project.area}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {project.description && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                                )}

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                                        <span className="text-xs text-gray-900 dark:text-white font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-purple-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Members</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{project.memberCount}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Meetings</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{project.totalMeetings}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Avg CPI</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">
                                            {project.average_cpi ? project.average_cpi.toFixed(2) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-white/10 pt-4 mb-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Team Leader</p>
                                    {project.project_group_member.find(m => m.is_leader) ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center"><span className="text-white text-xs font-bold">
                                                    {project.project_group_member.find(m => m.is_leader)?.student.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-gray-900 dark:text-white text-sm font-medium">
                                                    {project.project_group_member.find(m => m.is_leader)?.student.name}
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                    {project.project_group_member.find(m => m.is_leader)?.student.enrollment_no}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No leader assigned</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/faculty/projects/${project.id}`}
                                        className="flex-1 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 transition-all text-sm text-center"
                                    >
                                        View Details
                                    </Link>
                                    <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 transition-all">
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

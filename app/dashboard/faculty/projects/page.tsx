'use client';

import { useEffect, useState } from 'react';
import FacultyLayout from '@/components/FacultyLayout';
import { FolderKanban, Users, Calendar, TrendingUp, Filter, Search, ExternalLink, Clock } from 'lucide-react';

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
            <FacultyLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            </FacultyLayout>
        );
    }

    return (
        <FacultyLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-white/40">Monitor project progress and team performance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <FolderKanban className="w-5 h-5 text-purple-400" />
                            <span className="text-white/40 text-sm">Total Projects</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{projects.length}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <span className="text-white/40 text-sm">In Progress</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {projects.filter(p => p.progress > 0 && p.progress < 100).length}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            <span className="text-white/40 text-sm">Total Students</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {projects.reduce((sum, p) => sum + p.memberCount, 0)}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            <span className="text-white/40 text-sm">Total Meetings</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {projects.reduce((sum, p) => sum + p.totalMeetings, 0)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    >
                        <option value="all">All Types</option>
                        {projectTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/10">
                        <FolderKanban className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg">No projects found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                                        <p className="text-white/60 text-sm mb-3">{project.title}</p>
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
                                    <p className="text-white/40 text-sm mb-4 line-clamp-2">{project.description}</p>
                                )}

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-white/40">Progress</span>
                                        <span className="text-xs text-white font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-purple-400" />
                                            <span className="text-xs text-white/40">Members</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{project.memberCount}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs text-white/40">Meetings</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{project.totalMeetings}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs text-white/40">Avg CPI</span>
                                        </div>
                                        <p className="text-lg font-semibold text-white">
                                            {project.average_cpi ? project.average_cpi.toFixed(2) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 mb-4">
                                    <p className="text-xs text-white/40 mb-2">Team Leader</p>
                                    {project.project_group_member.find(m => m.is_leader) ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {project.project_group_member.find(m => m.is_leader)?.student.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">
                                                    {project.project_group_member.find(m => m.is_leader)?.student.name}
                                                </p>
                                                <p className="text-white/40 text-xs">
                                                    {project.project_group_member.find(m => m.is_leader)?.student.enrollment_no}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white/40 text-sm">No leader assigned</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 transition-all text-sm">
                                        View Details
                                    </button>
                                    <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
}

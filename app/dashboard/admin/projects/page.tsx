'use client';

import { useState, useEffect } from 'react';
import {
    FolderKanban,
    Search,
    Loader2,
    Users,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    Edit2,
    Save,
    X
} from 'lucide-react';

interface Staff {
    id: number;
    name: string;
}

interface ProjectGroup {
    id: number;
    name: string;
    title: string;
    description: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    project_group_member: {
        student: { name: string };
    }[];
    staff_project_group_guide_idTostaff?: { id: number; name: string } | null;
}

export default function ProjectsPage() {
    const [groups, setGroups] = useState<ProjectGroup[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ guide_id: '', status: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [groupsRes, staffRes] = await Promise.all([
                fetch('/api/admin/projects'),
                fetch('/api/admin/staff')
            ]);

            if (groupsRes.ok && staffRes.ok) {
                const groupsData = await groupsRes.json();
                const staffData = await staffRes.json();
                setGroups(groupsData);
                setStaff(staffData.filter((s: any) => s.role === 'FACULTY'));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (group: ProjectGroup) => {
        setEditingGroupId(group.id);
        setEditForm({
            guide_id: group.staff_project_group_guide_idTostaff?.id?.toString() || '',
            status: group.status || 'PENDING'
        });
    };

    const handleSave = async (id: number) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guide_id: editForm.guide_id ? parseInt(editForm.guide_id) : null,
                    status: editForm.status
                })
            });

            if (res.ok) {
                await fetchData();
                setEditingGroupId(null);
            } else {
                alert('Failed to update group');
            }
        } catch (error) {
            console.error('Error updating:', error);
            alert('An error occurred while updating');
        } finally {
            setSaving(false);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case 'REJECTED': return <XCircle className="w-3 h-3 mr-1" />;
            default: return <Clock className="w-3 h-3 mr-1" />;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Groups</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage student groups, assign guides, and approve projects</p>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                    type="text"
                    placeholder="Search groups or projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                />
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading project groups...</p>
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                    <FolderKanban className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{searchQuery ? 'No groups found' : 'No groups created yet'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <div key={group.id} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all group/card flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                                    <FolderKanban className="w-6 h-6 text-orange-400" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center ${getStatusStyle(group.status || 'PENDING')}`}>
                                        {getStatusIcon(group.status || 'PENDING')}
                                        {(group.status || 'PENDING').charAt(0) + (group.status || 'PENDING').slice(1).toLowerCase()}
                                    </span>
                                    {editingGroupId !== group.id && (
                                        <button
                                            onClick={() => handleEdit(group)}
                                            className="opacity-0 group-hover/card:opacity-100 p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all"
                                            title="Edit group"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1" title={group.title}>{group.title}</h3>
                            <div className="text-sm font-medium text-orange-500 dark:text-orange-400 mb-3">{group.name}</div>

                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                                {group.description || 'No description provided'}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/5">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{group.project_group_member?.length || 0} members</span>
                                </div>

                                {editingGroupId === group.id ? (
                                    <div className="space-y-3 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-200 dark:border-white/5 mt-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Assign Guide</label>
                                            <select
                                                value={editForm.guide_id}
                                                onChange={(e) => setEditForm({ ...editForm, guide_id: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-[#0a0a12] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/50"
                                            >
                                                <option value="">No Guide</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-[#0a0a12] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/50"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <button
                                                onClick={() => handleSave(group.id)}
                                                disabled={saving}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingGroupId(null)}
                                                disabled={saving}
                                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-200 dark:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <User className="w-4 h-4 shrink-0" />
                                        <span className="truncate">
                                            {group.staff_project_group_guide_idTostaff
                                                ? `Guide: ${group.staff_project_group_guide_idTostaff.name}`
                                                : 'No guide assigned'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

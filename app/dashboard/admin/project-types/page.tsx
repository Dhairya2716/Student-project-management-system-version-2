'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface ProjectType {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

export default function ProjectTypesPage() {
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Form Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: 0, name: '', description: '' });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<ProjectType | null>(null);

    useEffect(() => {
        fetchProjectTypes();
    }, []);

    const fetchProjectTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/project-types', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProjectTypes(data);
            }
        } catch (error) {
            console.error('Error fetching project types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (type?: ProjectType) => {
        if (type) {
            setIsEditing(true);
            setFormData({
                id: type.id,
                name: type.name,
                description: type.description || ''
            });
        } else {
            setIsEditing(false);
            setFormData({ id: 0, name: '', description: '' });
        }
        setFormError('');
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setFormData({ id: 0, name: '', description: '' });
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const url = isEditing
                ? `/api/admin/project-types/${formData.id}`
                : '/api/admin/project-types';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description
                })
            });

            const data = await response.json();

            if (response.ok) {
                await fetchProjectTypes();
                handleCloseForm();
            } else {
                setFormError(data.error || 'Something went wrong');
            }
        } catch (error) {
            setFormError('Failed to save project type');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (type: ProjectType) => {
        setTypeToDelete(type);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!typeToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/project-types/${typeToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchProjectTypes();
                setIsDeleteModalOpen(false);
                setTypeToDelete(null);
            } else {
                alert('Failed to delete project type');
            }
        } catch (error) {
            console.error('Error deleting project type:', error);
            alert('An error occurred while deleting');
        }
    };

    const filteredTypes = projectTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <div className="p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Types</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage different types of projects (Major, Mini, etc.)</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search project types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={() => handleOpenForm()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Type</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTypes.map((type) => (
                        <div
                            key={type.id}
                            className="group relative bg-white dark:bg-[#1a1a24] backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Card Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-bl-[100px] -z-10 transition-all duration-300 group-hover:scale-110"></div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-400/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{type.name}</h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">ID: TYP-{type.id.toString().padStart(3, '0')}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenForm(type)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Edit Type"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(type)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete Type"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {type.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    ))}

                    {filteredTypes.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white/50 dark:bg-white/[0.02] border border-gray-200 border-dashed dark:border-white/10 rounded-2xl">
                            <Layers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Project Types Found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {searchTerm ? 'No project types match your search criteria.' : 'Get started by creating your first project type.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => handleOpenForm()}
                                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Add Project Type
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a24] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {isEditing ? 'Edit Project Type' : 'Add Project Type'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {isEditing ? 'Update the details for this type' : 'Create a new project classification'}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseForm}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>{formError}</p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Type Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a12] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-gray-900 dark:text-white transition-all"
                                    placeholder="e.g., Major Project"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a12] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-gray-900 dark:text-white transition-all resize-none"
                                    placeholder="Brief description of this project type..."
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/5 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.name.trim()}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>{isEditing ? 'Update Type' : 'Create Type'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && typeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a24] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Project Type?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">{typeToDelete.name}</span>? This action cannot be undone.
                            </p>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 rounded-xl transition-all"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

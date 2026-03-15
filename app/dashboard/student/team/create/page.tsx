'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Search,
    X,
    FolderKanban,
    Building,
    ChevronDown,
    UserPlus
} from 'lucide-react';
import Link from 'next/link';

interface Student {
    id: number;
    name: string;
    enrollment_no: string;
}

interface ProjectType {
    id: number;
    name: string;
    description: string | null;
}

// Hardcoded fallback project types in case DB is empty
const FALLBACK_PROJECT_TYPES: Omit<ProjectType, 'id'>[] = [
    { name: 'Web Development', description: 'Web-based software applications' },
    { name: 'Mobile App Development', description: 'iOS and Android applications' },
    { name: 'Machine Learning / AI', description: 'AI models and ML algorithms' },
    { name: 'Data Science', description: 'Data analytics and visualization' },
    { name: 'Cybersecurity', description: 'Security tools and analysis' },
    { name: 'Internet of Things (IoT)', description: 'Hardware/software integrations' },
    { name: 'Blockchain / Web3', description: 'Decentralized applications' },
    { name: 'Cloud Computing', description: 'Cloud infrastructure and services' },
    { name: 'Desktop Application', description: 'Native desktop software' },
    { name: 'Embedded Systems', description: 'Microcontrollers and hardware' },
];

export default function CreateTeamPage() {
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

    // Form State
    const [title, setTitle] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [area, setArea] = useState('');
    const [projectTypeId, setProjectTypeId] = useState('');

    // Selection state for students
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const [studentsRes, typesRes] = await Promise.all([
                    fetch('/api/student/available-students', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/student/project-types', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (studentsRes.ok) {
                    const data = await studentsRes.json();
                    setAvailableStudents(Array.isArray(data) ? data : []);
                }

                if (typesRes.ok) {
                    const data = await typesRes.json();
                    // If DB returns types, use them; otherwise use fallbacks with negative IDs
                    if (Array.isArray(data) && data.length > 0) {
                        setProjectTypes(data);
                    } else {
                        setProjectTypes(
                            FALLBACK_PROJECT_TYPES.map((t, i) => ({ ...t, id: -(i + 1) }))
                        );
                    }
                } else {
                    // Use fallbacks with negative IDs
                    setProjectTypes(
                        FALLBACK_PROJECT_TYPES.map((t, i) => ({ ...t, id: -(i + 1) }))
                    );
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Could not load required data. Please refresh.');
                // Still show fallback project types
                setProjectTypes(
                    FALLBACK_PROJECT_TYPES.map((t, i) => ({ ...t, id: -(i + 1) }))
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectStudent = (student: Student) => {
        if (!selectedStudents.find(s => s.id === student.id)) {
            setSelectedStudents([...selectedStudents, student]);
        }
        setSearchQuery('');
        setShowDropdown(false);
    };

    const handleRemoveStudent = (studentId: number) => {
        setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title || !name || !projectTypeId) {
            setError('Please fill in all required fields.');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // If using a fallback (negative id), send 0 so the backend can handle it
            const typeId = Number(projectTypeId);

            const response = await fetch('/api/student/team/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    name,
                    description,
                    area,
                    project_type_id: typeId > 0 ? typeId : null,
                    selected_student_ids: selectedStudents.map(s => s.id)
                })
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/student');
                router.refresh();
            } else {
                setError(data.error || 'Failed to create team');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('An error occurred while creating the team.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = availableStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedStudents.find(s => s.id === student.id)
    );

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="p-6 max-w-5xl mx-auto py-8">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Link
                        href="/dashboard/student"
                        className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form a Team</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Set up your project details and invite your peers.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                        <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left — Project Details */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FolderKanban className="w-5 h-5 text-emerald-500" />
                                    Project Information
                                </h2>

                                <div className="grid grid-cols-1 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Group Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Innovators, Team Alpha"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Project Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter the full title of your project"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Project Type <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={projectTypeId}
                                                    onChange={(e) => setProjectTypeId(e.target.value)}
                                                    className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                                                >
                                                    <option value="">— Select a type —</option>
                                                    {projectTypes.map(type => (
                                                        <option key={type.id} value={type.id.toString()}>
                                                            {type.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Project Area / Domain
                                            </label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={area}
                                                    onChange={(e) => setArea(e.target.value)}
                                                    placeholder="e.g. Healthcare, Finance"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            placeholder="Provide a brief abstract or summary of the project goals..."
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link
                                    href="/dashboard/student"
                                    className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-gray-900 dark:text-white font-medium transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Submit Project Group
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right — Team Members */}
                    <div className="lg:col-span-1 space-y-5">
                        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                                <Users className="w-5 h-5 text-emerald-500" />
                                Team Members
                            </h2>

                            {/* Search input with inline dropdown results */}
                            <div className="mb-5" ref={searchRef}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Search &amp; Add Members
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Search by name..."
                                        autoComplete="off"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>

                                {/* Results list — inline, not absolute */}
                                {showDropdown && searchQuery.trim() !== '' && (
                                    <div className="mt-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg max-h-44 overflow-y-auto">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map(student => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // keep focus in search
                                                        handleSelectStudent(student);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 flex items-center gap-3"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                        <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.enrollment_no}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                No available students match &quot;{searchQuery}&quot;
                                            </div>
                                        )}
                                    </div>
                                )}

                                {showDropdown && searchQuery.trim() === '' && availableStudents.length > 0 && (
                                    <div className="mt-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg max-h-44 overflow-y-auto">
                                        {availableStudents
                                            .filter(s => !selectedStudents.find(sel => sel.id === s.id))
                                            .map(student => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleSelectStudent(student);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 flex items-center gap-3"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                        <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.enrollment_no}</p>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected members list */}
                            <div className="space-y-2">
                                {/* Creator (always present) */}
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <Users className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">You</p>
                                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Group Leader</p>
                                    </div>
                                </div>

                                {selectedStudents.map(student => (
                                    <div key={student.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                                            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{student.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.enrollment_no}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {selectedStudents.length === 0 && (
                                    <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-3">
                                        Search above to add team members
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Total Members</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedStudents.length + 1}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
                            <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-1">Note</h3>
                            <p className="text-xs text-cyan-700/80 dark:text-cyan-400/80">
                                Your group will be placed in a <strong>PENDING</strong> state. An admin or faculty convener must approve it before a guide is assigned.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

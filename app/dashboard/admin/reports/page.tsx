'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Users,
    GraduationCap,
    FolderKanban,
    Building,
    BookOpen,
    Loader2,
    PieChart,
    TrendingUp
} from 'lucide-react';
import CountUp from '@/components/reactbits/CountUp';
import BlurText from '@/components/reactbits/BlurText';

interface ReportData {
    overview: {
        totalStudents: number;
        totalStaff: number;
        totalProjects: number;
        totalDepartments: number;
        totalBatches: number;
    };
    projectsByStatus: Record<string, number>;
    studentsByDepartment: Array<{ department: string; count: number }>;
}

export default function AdminReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<string | null>(null);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: string) => {
        try {
            setExporting(type);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/reports/export?type=${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_export.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const statsCards = [
        { label: 'Total Students', value: data.overview.totalStudents, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { label: 'Total Staff', value: data.overview.totalStaff, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { label: 'Total Projects', value: data.overview.totalProjects, icon: FolderKanban, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
        { label: 'Departments', value: data.overview.totalDepartments, icon: Building, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        { label: 'Batches', value: data.overview.totalBatches, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    ];

    // Calculate percentages for project status
    const totalStatusProjects = Object.values(data.projectsByStatus).reduce((a, b) => a + b, 0) || 1; // Avoid div by 0

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <BlurText
                        text="System Reports"
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                        delay={50}
                    />
                    <p className="text-gray-500 dark:text-gray-400">
                        View analytics and export system data for offline analysis.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => handleExport('students')}
                        disabled={exporting !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm disabled:opacity-50"
                    >
                        {exporting === 'students' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="text-sm font-medium">Export Students</span>
                    </button>
                    <button
                        onClick={() => handleExport('staff')}
                        disabled={exporting !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm disabled:opacity-50"
                    >
                        {exporting === 'staff' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="text-sm font-medium">Export Staff</span>
                    </button>
                    <button
                        onClick={() => handleExport('projects')}
                        disabled={exporting !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
                    >
                        {exporting === 'projects' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="text-sm font-medium">Export Projects</span>
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statsCards.map((stat, i) => (
                    <div
                        key={i}
                        className="p-5 bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    <CountUp to={stat.value} duration={1.5} />
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Chart (Custom Implementation) */}
                <div className="p-6 bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-orange-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Status Distribution</h2>
                    </div>

                    <div className="space-y-6">
                        {['APPROVED', 'PENDING', 'REJECTED'].map((status) => {
                            const count = data.projectsByStatus[status] || 0;
                            const percentage = Math.round((count / totalStatusProjects) * 100) || 0;

                            const colorClass =
                                status === 'APPROVED' ? 'bg-emerald-500' :
                                    status === 'PENDING' ? 'bg-amber-500' :
                                        'bg-red-500';

                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{status.toLowerCase()}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{count} projects ({percentage}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Students by Department (Custom Implementation) */}
                <div className="p-6 bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Students per Department</h2>
                    </div>

                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.studentsByDepartment.length > 0 ? (
                            data.studentsByDepartment.map((item, index) => {
                                const maxCount = Math.max(...data.studentsByDepartment.map(d => d.count)) || 1;
                                const width = Math.max((item.count / maxCount) * 100, 5); // min 5% width

                                return (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={item.department}>
                                            {item.department}
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg overflow-hidden flex-1 relative">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000 ease-out rounded-lg"
                                                    style={{ width: `${width}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-8 text-sm text-gray-500 dark:text-gray-400 text-right">{item.count}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No department data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

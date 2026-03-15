'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, User, Loader2, ArrowRight, Phone } from 'lucide-react';
import ClickSpark from '@/components/reactbits/ClickSpark';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import BlurText from '@/components/reactbits/BlurText';
import GradientText from '@/components/reactbits/GradientText';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            router.push('/login?registered=true');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    const inputFields = [
        { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Enter your full name' },
        { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'Enter your email' },
        { name: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' },
        { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a password' },
    ];

    return (
        <ClickSpark sparkColor="#a855f7" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12] flex items-center justify-center p-6 overflow-hidden transition-colors duration-500">
                {/* Animated Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-400/[0.08] dark:bg-purple-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-violet-400/[0.08] dark:bg-violet-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                </div>

                <div className="relative w-full max-w-md animate-fade-in-up">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                                <img src="/logo.png" alt="StudentSync" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-400 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            </div>
                            <GradientText colors={['#a855f7', '#8b5cf6', '#a855f7']} animationSpeed={3} showBorder={false}>
                                <span className="text-3xl font-bold bg-clip-text text-transparent">StudentSync</span>
                            </GradientText>
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/15 to-violet-500/15 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[2rem] blur-xl opacity-50"></div>

                        <SpotlightCard className="relative bg-white/90 dark:bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-white/10 p-8 shadow-xl dark:shadow-2xl" spotlightColor="rgba(168, 85, 247, 0.15)">
                            <div className="text-center mb-8">
                                <BlurText text="Create Account" className="text-3xl font-bold text-gray-900 dark:text-white mb-2" delay={30} />
                                <p className="text-gray-500 dark:text-white/50">Join StudentSync to manage your projects</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {inputFields.map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70">{field.label}</label>
                                        <div className="relative group">
                                            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" />
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={(formData as Record<string, string>)[field.name]}
                                                onChange={handleChange}
                                                placeholder={field.placeholder}
                                                required={field.name !== 'phone'}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400/50 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full py-4 overflow-hidden rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500"></span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></span>
                                    <span className="relative flex items-center justify-center gap-2 text-white">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-8">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                                <span className="text-gray-400 dark:text-white/30 text-sm">or</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                            </div>

                            {/* Footer */}
                            <p className="text-center text-gray-500 dark:text-white/50 text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </ClickSpark>
    );
}

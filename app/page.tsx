'use client';

import Link from 'next/link';
import { GraduationCap, Users, ClipboardList, Calendar, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';


export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[150px]"></div>
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 shadow-2xl">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">SPMS</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-all duration-300 hover:bg-white/5 rounded-xl"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="group relative px-5 py-2.5 text-sm font-medium overflow-hidden rounded-xl"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                <span className="relative text-white font-semibold">Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Student Project Management System</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              <span className="text-white">Manage Your</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient">
                Academic Projects
              </span>
              <br />
              <span className="text-white">Efficiently</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              A comprehensive platform for students, faculty, and administrators to manage academic projects, track progress, and collaborate seamlessly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold overflow-hidden rounded-2xl transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></span>
                <span className="relative flex items-center gap-2 text-white">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-white/5 backdrop-blur-sm text-white rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span>Login to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/3 left-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float">
          <Users className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="absolute top-1/2 right-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
          <Calendar className="w-7 h-7 text-cyan-400" />
        </div>
        <div className="absolute bottom-1/4 left-20 w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
          <ClipboardList className="w-6 h-6 text-teal-400" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Powerful features to manage your academic projects from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Group Formation', desc: 'Form project groups and assign team members with ease', color: 'emerald' },
              { icon: GraduationCap, title: 'Guide Allocation', desc: 'Smart faculty guide assignment system', color: 'cyan' },
              { icon: Calendar, title: 'Meeting Tracking', desc: 'Schedule, track, and manage project meetings', color: 'teal' },
              { icon: ClipboardList, title: 'Progress Reports', desc: 'Generate detailed analytics and reports', color: 'emerald' },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-${feature.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-500/5 border border-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="relative text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="relative text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '500+', label: 'Active Projects' },
              { value: '2,000+', label: 'Students' },
              { value: '100+', label: 'Faculty Guides' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-white/50 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/10 backdrop-blur-sm overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]"></div>

            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                Join thousands of students and faculty managing their academic projects efficiently
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:bg-white/90 transition-all duration-300"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white/80">SPMS</span>
          </div>
          <p className="text-white/40 text-sm">© 2026 Student Project Management System. All rights reserved.</p>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

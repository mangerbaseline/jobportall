"use client";
import { HomeCard } from "@/components/home/seek";
import GradientBlobs from "@/components/bg/gradientblobs";
import {
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  Search,
  FileCheck,
  Star,
  Zap,
  Shield,
} from "lucide-react";

const stats = [
  { icon: Briefcase, value: "1,200+", label: "Active Jobs" },
  { icon: Building2, value: "850+", label: "Companies" },
  { icon: Users, value: "4,500+", label: "Job Seekers" },
  { icon: TrendingUp, value: "92%", label: "Placement Rate" },
];

const seekerSteps = [
  {
    icon: Search,
    title: "Search & Discover",
    desc: "Browse thousands of jobs filtered by role, location, and salary.",
  },
  {
    icon: FileCheck,
    title: "Apply with Ease",
    desc: "One-click applications with your saved profile and resume.",
  },
  {
    icon: Star,
    title: "Get Hired",
    desc: "Connect directly with employers and land your dream job.",
  },
];

const employerSteps = [
  {
    icon: Zap,
    title: "Post in Minutes",
    desc: "Create a detailed job listing with salary, location, and requirements.",
  },
  {
    icon: Users,
    title: "Review Candidates",
    desc: "Browse qualified applicants and filter by skills and experience.",
  },
  {
    icon: Shield,
    title: "Hire with Confidence",
    desc: "Verified profiles and direct messaging to close hires faster.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <GradientBlobs />

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            1,200+ jobs posted this month
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s", opacity: 0 }}
          >
            Find Your <span className="brand-text">Dream Job</span>
            <br />
            or Your Next <span className="brand-text">Great Hire</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            JobPortal connects exceptional Job with world-class employers.
            Whether you&apos;re searching or hiring — we make it seamless.
          </p>

          {/* CTA Cards */}
          <div
            className="flex flex-col sm:flex-row gap-5 justify-center items-stretch max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.3s", opacity: 0 }}
          >
            <HomeCard seek="Seeker" link="/user" />
            <HomeCard postJob="Post Job" link="/employer" />
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="glass-card rounded-2xl p-6 text-center hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl brand-gradient mx-auto mb-3 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold brand-text mb-1">
                  {value}
                </div>
                <div className="text-xs text-white/50 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              How <span className="brand-text">JobPortal</span> Works
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Simple, fast, and built for both job seekers and employers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Seeker steps */}
            <div className="glass-card rounded-3xl p-8 space-y-6 hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-indigo-200">
                  For Job Seekers
                </h3>
              </div>
              {seekerSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm mb-0.5">
                        {step.title}
                      </p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Employer steps */}
            <div className="glass-card rounded-3xl p-8 space-y-6 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-violet-200">
                  For Employers
                </h3>
              </div>
              {employerSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm mb-0.5">
                        {step.title}
                      </p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12 border-indigo-500/20 glow-indigo">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to take the next step?
          </h2>
          <p className="text-white/50 mb-8">
            Join thousands of professionals already using JobPortal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="px-8 py-3.5 font-semibold text-white rounded-xl brand-gradient hover:opacity-90 transition-all duration-200 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
            >
              Create Free Account
            </a>
            <a
              href="/user"
              className="px-8 py-3.5 font-semibold text-white/80 rounded-xl bg-white/8 border border-white/12 hover:bg-white/12 hover:text-white transition-all duration-200"
            >
              Browse Jobs
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React from "react";
import { 
  Briefcase, 
  MapPin, 
  CircleDollarSign, 
  Calendar, 
  Edit3,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";

interface JobDetailsCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary: number | null;
    vacancy?: number;
    createdAt: string;
  };
}

export default function JobDetailsCard({ job }: JobDetailsCardProps) {
  const router = useRouter();

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-8 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Briefcase className="w-32 h-32 text-indigo-400" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CircleDollarSign className="w-4 h-4" />
                  {job.salary ? `$${job.salary.toLocaleString()}` : "Not specified"}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(`/employer/update-job/${job.id}`)}
              className="group flex items-center justify-center gap-2 px-6 py-3 rounded-2xl brand-gradient text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Update Job
            </button>
          </div>
        </div>
      </div>

      {/* Description Content */}
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full bg-indigo-500" />
            Job Description
          </h3>
          <div className="text-white/70 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
            {job.description}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Positions
            </div>
            <div className="text-2xl font-bold text-white">
              {job.vacancy || 0} Openings
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              Posted On
            </div>
            <div className="text-2xl font-bold text-white">
              {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

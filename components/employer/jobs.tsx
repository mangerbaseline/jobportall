"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/lib/hook/hook";
import {
  Briefcase,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  CircleDollarSign,
  Users,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import Link from "next/link";

const JOBS_PER_PAGE = 5;

/** Deterministic gradient by string hash */
function gradientFromString(str: string) {
  const gradients = [
    "from-indigo-500 to-indigo-700",
    "from-violet-500 to-violet-700",
    "from-sky-500 to-sky-700",
    "from-emerald-500 to-emerald-700",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function Jobs() {
  const { data, loading } = useAppSelector((state) => state.details);
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-5 h-28 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data || !data.jobs || data.jobs.length === 0) {
    return (
      <div className="w-full p-16 glass-card rounded-3xl flex flex-col items-center justify-center gap-4 border-dashed">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-base font-semibold text-white/40">
          No jobs posted yet
        </p>
        <p className="text-xs text-white/30 text-center max-w-xs">
          Use the &quot;Post New Job&quot; button above to create your first
          listing.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.jobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const currentJobs = data.jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your Listings</h3>
            <p className="text-xs text-white/40">
              {data.jobs.length} active jobs
            </p>
          </div>
        </div>
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {currentJobs.map((job) => {
          const grad = gradientFromString(job.title ?? "job");
          const fillRate =
            job.vacancy > 0
              ? Math.min(
                  100,
                  Math.round((job._count.applications / job.vacancy) * 100),
                )
              : 0;

          return (
            <Link
              key={job.id}
              href={`/employer/job/${job.id}`} //`/employer/update-job/${job.id}`
              className="block"
            >
              <div className="group glass-card rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left: icon + info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-base font-extrabold text-white shadow-lg`}
                    >
                      {job.title?.charAt(0)?.toUpperCase() ?? "J"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-base group-hover:text-indigo-200 transition-colors truncate">
                        {job.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-white/45">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-white/30" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CircleDollarSign className="w-3 h-3" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/30" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Vacancy fill bar */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 max-w-[160px] h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                            style={{ width: `${fillRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40">
                          {job._count.applications}/{job.vacancy} filled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: stats */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <div className="text-center">
                        <div className="text-sm font-bold text-indigo-300">
                          {job._count.applications}
                        </div>
                        <div className="text-xs text-indigo-400/60 uppercase tracking-wider">
                          Apps
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                      <Users className="w-3.5 h-3.5 text-violet-400" />
                      <div className="text-center">
                        <div className="text-sm font-bold text-violet-300">
                          {job.vacancy}
                        </div>
                        <div className="text-xs text-violet-400/60 uppercase tracking-wider">
                          Open
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-card text-sm text-white/60 hover:text-white hover:border-indigo-500/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === i + 1
                    ? "brand-gradient text-white shadow-lg shadow-indigo-500/30"
                    : "glass-card text-white/50 hover:text-white hover:border-indigo-500/30"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-card text-sm text-white/60 hover:text-white hover:border-indigo-500/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

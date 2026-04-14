"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/lib/hook/hook";
import {
  Briefcase,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import Link from "next/link";

const JOBS_PER_PAGE = 5;

export default function Jobs() {
  const { data, loading } = useAppSelector((state) => state.details);
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return (
      <div className="w-full max-w-7xl space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data || !data.jobs || data.jobs.length === 0) {
    return (
      <div className="w-full max-w-7xl p-12 rounded-2xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-500 gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Briefcase className="w-8 h-8 opacity-20" />
        </div>
        <p className="text-lg font-medium">No jobs posted yet</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.jobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const currentJobs = data.jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Optional: scroll to top of list
  };

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-blue-500" />
          Active Listings
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({data.jobs.length} total)
          </span>
        </h2>
      </div>

      <div className="grid gap-4">
        {currentJobs.map((job) => (
          <Link key={job.id} href={`/employer/update-job/${job.id}`}>
            <div className="group p-5 rounded-2xl border border-gray-200 bg-white/5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:bg-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-700 group-hover:text-blue-500 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CircleDollarSign className="w-4 h-4 text-green-400" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-400" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex flex-col items-center min-w-[100px]">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Apps
                    </span>
                    <span className="text-lg font-bold">
                      {job._count.applications}
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-500 flex flex-col items-center min-w-[80px]">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Vac
                    </span>
                    <span className="text-lg font-bold">{job.vacancy}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-gray-200 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`w-10 h-10 rounded-xl border transition-all duration-300 font-medium ${
                  currentPage === i + 1
                    ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "border-gray-200 bg-white/5 hover:border-gray-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-gray-200 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

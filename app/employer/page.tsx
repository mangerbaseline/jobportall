"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hook/hook";
import React, { useState, useEffect } from "react";
import { CreatePostForm } from "@/components/employer/CreatePost";
import Jobs from "@/components/employer/jobs";
import UserDetail from "@/components/employer/userDetail";
import { Plus, X, Briefcase, LayoutDashboard } from "lucide-react";

export default function EmployerDashboard() {
  const router = useRouter();
  const [postjob, setPostjob] = useState(false);
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    setPostjob(false);
    if (user.loading) return;
    if (user.role === "USER") router.push("/user");
    else if (user.role === "ADMIN") router.push("/admin");
  }, [user.role, user.loading, router]);

  if (user.loading) {
    return (
      <div className="flex h-screen w-full justify-center items-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Employer Dashboard is it ?</span>
          <span className="sm:hidden">Dashboard</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:block text-sm text-slate-500 truncate max-w-[140px]">
            {user.name || "Employer"}
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center shrink-0">
            {user.name?.charAt(0).toUpperCase() ?? "E"}
          </div>
        </div>
      </header>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-1">Welcome back</p>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800 truncate">
              {user.name || "Employer"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your job postings and track applications.
            </p>
          </div>
          <button
            onClick={() => setPostjob((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shrink-0 ${
              postjob
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {postjob ? (
              <>
                <X className="w-4 h-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Post a job
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* User profile */}
        <section>
          <UserDetail />
        </section>

        {/* Create post form */}
        {postjob && (
          <section className="animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-base font-semibold text-slate-700">
                  New job listing
                </h2>
                <button
                  onClick={() => setPostjob(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 rounded"
                  aria-label="Close form"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <CreatePostForm onClose={() => setPostjob(false)} />
            </div>
          </section>
        )}

        {/* Jobs list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Your job listings</span>
            </h2>
          </div>
          <Jobs />
        </section>
      </main>
    </div>
  );
}

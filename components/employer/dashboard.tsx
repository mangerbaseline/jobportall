"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hook/hook";
import React, { useState, useEffect } from "react";
import { CreatePostForm } from "@/components/employer/CreatePost";
import Jobs from "@/components/employer/jobs";
import UserDetail from "@/components/employer/userDetail";
import GradientBlobs from "@/components/bg/gradientblobs";
import { Plus, X, Briefcase, Loader2 } from "lucide-react";

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
      <div className="flex h-screen w-full justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-white/40 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Employer <span className="brand-text">Dashboard</span>
            </h1>
            <p className="text-sm text-white/45 mt-1">
              Welcome back, {user.name || "Employer"} — manage your listings and
              track applications.
            </p>
          </div>

          <button
            onClick={() => setPostjob((prev) => !prev)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shrink-0 ${
              postjob
                ? "bg-white/10 border border-white/15 text-white/70 hover:bg-white/15"
                : "brand-gradient text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 hover:scale-105"
            }`}
          >
            {postjob ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Post a Job
              </>
            )}
          </button>
        </div>

        {/* ── Employer Profile Card ── */}
        <UserDetail />

        {/* ── Create Post Form (toggle) ── */}
        {postjob && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                New Job Listing
              </h2>
              <button
                onClick={() => setPostjob(false)}
                className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/12 transition-all duration-200"
                aria-label="Close form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <CreatePostForm onClose={() => setPostjob(false)} />
          </div>
        )}

        {/* ── Jobs List ── */}
        <Jobs />
      </div>
    </div>
  );
}

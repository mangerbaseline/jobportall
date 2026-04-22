"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hook/hook";
import CustomerQueriesTable from "@/components/customer-queries-table";
import { MessageSquare, LayoutDashboard, Loader2 } from "lucide-react";
import GradientBlobs from "@/components/bg/gradientblobs";

export default function CustomerQueriesPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!user.loading && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user.loading, user.role, router]);

  if (user.loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[oklch(0.05_0_0)]">
      <GradientBlobs />

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Admin Dashboard
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                Customer <span className="brand-text">Queries</span>
              </h1>
              <p className="mt-4 text-base text-white/40 max-w-2xl leading-relaxed font-medium">
                Review and manage all incoming customer support requests and
                inquiries. Search through submissions and view detailed message
                contents.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white brand-gradient rounded-2xl shadow-2xl shadow-indigo-500/20 border border-white/10">
                <MessageSquare className="w-4 h-4" />
                Management Mode
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="glass-card rounded-[2.5rem] p-1.5 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="bg-white/2 rounded-[2.3rem] p-6 sm:p-10 backdrop-blur-3xl">
              <CustomerQueriesTable />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import React from "react";
import AdminTable from "@/components/admin-table";
import { Users, LayoutDashboard, Settings } from "lucide-react";
import GradientBlobs from "@/components/bg/gradientblobs";

export default function AdminPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      <GradientBlobs />

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Admin Control Panel
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
                User <span className="brand-text">Management</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed font-medium">
                Monitor and manage all system users, employers, and administrators. 
                View account statistics and manage access levels.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-xl hover:text-foreground hover:bg-accent transition-all">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white brand-gradient rounded-2xl shadow-2xl shadow-indigo-500/20 border-0">
                <Users className="w-4 h-4" />
                Manage Users
              </div>
            </div>
          </div>

          {/* ── Stats Summary ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">
            <div className="p-6 rounded-2xl glass-card">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">System Wide</h3>
            </div>
            <div className="p-6 rounded-2xl glass-card">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Employers</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">Verified Partners</h3>
            </div>
            <div className="p-6 rounded-2xl glass-card">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">Past 24 Hours</h3>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="glass-card rounded-[2.5rem] p-1.5 border border-border shadow-2xl overflow-hidden">
            <div className="bg-card/2 rounded-[2.3rem] p-6 sm:p-10 backdrop-blur-3xl">
              <AdminTable />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

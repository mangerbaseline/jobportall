import React from "react";
import AdminTable from "@/components/admin-table";
import { Users, LayoutDashboard, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Admin Control Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              User <span className="brand-text">Management</span>
            </h1>
            <p className="mt-3 text-lg text-white/40 max-w-2xl">
              Monitor and manage all system users, employers, and administrators. 
              View account statistics and manage access levels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-xl hover:text-white hover:bg-white/10 transition-all">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white brand-gradient rounded-xl shadow-lg shadow-indigo-500/20">
              <Users className="w-4 h-4" />
              Manage Users
            </div>
          </div>
        </div>

        {/* ── Stats Summary (Optional/Premium touch) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 glass-card">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold text-white mt-1">System Wide</h3>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 glass-card">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Active Employers</p>
            <h3 className="text-2xl font-bold text-white mt-1">Verified Partners</h3>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 glass-card">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Recent Activity</p>
            <h3 className="text-2xl font-bold text-white mt-1">Past 24 Hours</h3>
          </div>
        </div>

        {/* ── Main Content ── */}
        <AdminTable />
      </div>
    </main>
  );
}


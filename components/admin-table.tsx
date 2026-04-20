"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  ShieldCheck,
  MoreHorizontal,
  Mail,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Role = "USER" | "EMPLOYER" | "ADMIN";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  deleted: boolean;
  _count: {
    jobs: number;
    applications: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApplicationData {
  id: string;
  status: string;
  createdAt: string;
  employer: {
    name: string;
    companyName: string | null;
  };
  job: {
    id: string;
    title: string;
    location: string;
    salary: string;
  };
}

interface JobData {
  id: string;
  title: string;
  location: string;
  salary: number | null;
  vacancy: number;
  available: boolean;
  createdAt: string;
  _count: {
    applications: number;
  };
}

const AdminTable = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>("USER");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Applications Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<"applications" | "jobs">(
    "applications",
  );
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userApplications, setUserApplications] = useState<ApplicationData[]>(
    [],
  );
  const [userJobs, setUserJobs] = useState<JobData[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role,
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [role, page, search]);

  const toggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deleted: !currentStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, deleted: !currentStatus } : u,
          ),
        );
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
    }
  };

  const fetchUserApplications = async (user: UserData) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
    setLoadingApps(true);
    try {
      const response = await fetch(`/api/admin/applications?userId=${user.id}`);
      const result = await response.json();
      console.log("result : ", result);
      console.log("Applications response for user:", user.name, result);
      if (result.success) {
        setUserApplications(result.data);
      }
    } catch (error) {
      console.error("Error fetching user applications:", error);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchUserJobs = async (user: UserData) => {
    setSelectedUser(user);
    setViewType("jobs");
    setIsDialogOpen(true);
    setLoadingJobs(true);
    try {
      const response = await fetch(`/api/admin/jobs?employerId=${user.id}`);
      const result = await response.json();
      console.log("Jobs response for employer:", user.name, result);
      if (result.success) {
        setUserJobs(result.data);
      }
    } catch (error) {
      console.error("Error fetching user jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setPage(1);
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case "EMPLOYER":
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "EMPLOYER":
        return "Employer";
      default:
        return "Job Seeker";
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-up">
      {/* ── Header & Toggles ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
          {(["USER", "EMPLOYER", "ADMIN"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                role === r
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}s
            </button>
          ))}
        </div>

        <div className="relative group max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
        {loading && (
          <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">
                  {role === "EMPLOYER" ? "Jobs Posted" : "Applications"}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length > 0
                ? users.map((user) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-white/2 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-white/40">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 w-fit">
                          {getRoleIcon(user.role)}
                          <span className="text-xs font-medium text-white/70">
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            if (role === "EMPLOYER") {
                              fetchUserJobs(user);
                            } else {
                              fetchUserApplications(user);
                            }
                          }}
                          className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 transition-all hover:bg-indigo-500/20 cursor-pointer"
                        >
                          {role === "EMPLOYER"
                            ? user._count.jobs
                            : user._count.applications}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.deleted ? (
                          <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleBlock(user.id, user.deleted)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                              user.deleted
                                ? "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                                : "text-red-400 border-red-500/20 hover:bg-red-500/10"
                            }`}
                          >
                            {user.deleted ? "Unblock" : "Block"}
                          </button>
                          <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-white/30">
                          <User className="w-12 h-12 stroke-1" />
                          <p className="text-sm">
                            No users found matching your criteria
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-white/10 bg-white/1">
            <p className="text-xs text-white/40">
              Showing{" "}
              <span className="text-white">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="text-white">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="text-white">{pagination.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg border border-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-all ${
                      pagination.page === i + 1
                        ? "bg-indigo-500 text-white"
                        : "text-white/40 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={!pagination.hasNextPage || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg border border-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Applications/Jobs Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#0B0F1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              {viewType === "applications"
                ? `Applications by ${selectedUser?.name}`
                : `Jobs Posted by ${selectedUser?.name}`}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {viewType === "applications"
                ? "Viewing all jobs applied for by this user."
                : "Viewing all jobs posted by this employer."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {viewType === "applications" ? (
              loadingApps ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm text-white/40">
                    Fetching applications...
                  </p>
                </div>
              ) : userApplications.length > 0 ? (
                <div className="space-y-3">
                  {userApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                              {app.job.title}
                            </h4>
                            <p className="text-xs text-white/60">
                              {app.employer?.companyName || app.employer?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{app.job.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              app.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : app.status === "ACCEPTED"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {app.status}
                          </span>
                          <div className="text-xs font-medium text-indigo-400">
                            {app.job.salary}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <Briefcase className="w-12 h-12 stroke-1 mb-3" />
                  <p className="text-sm">
                    No applications found for this user.
                  </p>
                </div>
              )
            ) : loadingJobs ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-white/40">Fetching jobs...</p>
              </div>
            ) : userJobs.length > 0 ? (
              <div className="space-y-3">
                {userJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {job._count.applications} Apps
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            job.available
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {job.available ? "Live" : "Closed"}
                        </span>
                        <div className="text-xs font-medium text-indigo-400">
                          {job.salary ? `$${job.salary}` : "Not Disclosed"}
                        </div>
                        <div className="text-[10px] text-white/30">
                          {job.vacancy} Vacancies
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/20">
                <Briefcase className="w-12 h-12 stroke-1 mb-3" />
                <p className="text-sm">No jobs posted by this employer.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTable;

"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Briefcase,
  FileText,
} from "lucide-react";
import Link from "next/link";
import type { UsersShow } from "@/types";

const LIMIT = 9;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Deterministic gradient by string hash */
function gradientFromString(str: string) {
  const gradients = [
    "from-indigo-500 to-indigo-700",
    "from-violet-500 to-violet-700",
    "from-sky-500 to-sky-700",
    "from-emerald-500 to-emerald-700",
    "from-rose-500 to-rose-700",
    "from-amber-500 to-amber-600",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

function CandidateSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/8 rounded-lg w-2/3" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="flex gap-3 pt-3 border-t border-white/6">
        <div className="h-7 w-24 bg-white/5 rounded-lg" />
        <div className="h-7 w-20 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export default function USER() {
  const [users, setUsers] = useState<UsersShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        role: "USER",
        page: String(currentPage),
        limit: String(LIMIT),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setUsers(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = (() => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    return Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === total || Math.abs(p - currentPage) <= 1)
      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
        acc.push(p);
        return acc;
      }, []);
  })();

  if (error) {
    return (
      <div className="h-64 w-full flex flex-col justify-center items-center gap-3 glass-card rounded-3xl">
        <p className="text-destructive text-sm">{error}</p>
        <button
          onClick={() => fetchUsers()}
          className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Job Seekers</h2>
            {pagination && !loading && (
              <p className="text-xs text-white/40">
                {pagination.total} candidates registered
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              id="candidate-search"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/35 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Employer avatar link */}
          <Link
            href="/employer/profile"
            className="shrink-0 w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform duration-200"
          >
            E
          </Link>
        </div>
      </div>

      {/* ── Results info ── */}
      {pagination && !loading && (
        <p className="text-xs text-white/40">
          Showing{" "}
          <span className="text-white/70 font-semibold">
            {(pagination.page - 1) * LIMIT + 1}–
            {Math.min(pagination.page * LIMIT, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="text-white/70 font-semibold">{pagination.total}</span>{" "}
          candidates
          {debouncedSearch && (
            <>
              {" "}for &quot;<em className="text-indigo-300">{debouncedSearch}</em>&quot;
            </>
          )}
        </p>
      )}

      {/* ── Candidate Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CandidateSkeleton key={i} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4 glass-card rounded-3xl">
          <Users className="w-14 h-14 text-white/15" />
          <p className="text-lg font-semibold text-white/40">No candidates found</p>
          {debouncedSearch && (
            <button
              onClick={() => setSearch("")}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user: UsersShow) => {
            const grad = gradientFromString(user.name ?? "user");
            return (
              <div
                key={user.id}
                className="group glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-500/35 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Top */}
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-base font-extrabold text-white shadow-lg`}
                  >
                    {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-white group-hover:text-indigo-200 transition-colors truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs text-white/40 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 pt-3 border-t border-white/6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs text-indigo-300 font-semibold">
                      {user._count?.jobs ?? 0} Jobs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs text-violet-300 font-semibold">
                      {user._count?.applications ?? 0} Apps
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-card text-sm text-white/60 hover:text-white hover:border-indigo-500/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((item, idx) =>
              item === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-white/30 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item as number)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    currentPage === item
                      ? "brand-gradient text-white shadow-lg shadow-indigo-500/30"
                      : "glass-card text-white/50 hover:text-white hover:border-indigo-500/30"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={!pagination.hasNextPage}
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

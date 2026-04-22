"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Loader2,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import GradientBlobs from "@/components/bg/gradientblobs";

const LIMIT = 9;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function colorFromString(str: string) {
  const colors = [
    "from-indigo-500 to-indigo-700",
    "from-violet-500 to-violet-700",
    "from-sky-500 to-sky-700",
    "from-emerald-500 to-emerald-700",
    "from-rose-500 to-rose-700",
    "from-amber-500 to-amber-700",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function JobCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/8 rounded-lg w-3/4" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded-lg" />
        <div className="h-3 bg-white/5 rounded-lg w-5/6" />
      </div>
      <div className="flex gap-3 pt-2 border-t border-white/6">
        <div className="h-3 w-20 bg-white/5 rounded-lg" />
        <div className="h-3 w-16 bg-white/5 rounded-lg" />
        <div className="h-3 w-14 bg-white/5 rounded-lg ml-auto" />
      </div>
    </div>
  );
}

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL params
  const initSearch = searchParams.get("search") ?? "";
  const initTitle = searchParams.get("title") ?? "";
  const initLocation = searchParams.get("location") ?? "";
  const initPage = parseInt(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(initSearch);
  const [jobs, setJobs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(initPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Build active filter labels for display
  const activeFilters = [
    initTitle && { key: "title", label: `Title: ${initTitle}` },
    initLocation && { key: "location", label: `Location: ${initLocation}` },
    initSearch && { key: "search", label: `Keyword: ${initSearch}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (initSearch) params.set("search", initSearch);
      if (initTitle) params.set("title", initTitle);
      if (initLocation) {
        params.set("location", initLocation);
        console.log(`Location init${initLocation} , ${params.getAll}`);
      }
      params.set("page", String(currentPage));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/job?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data.job ?? []);
      setPagination(data.pagination ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initSearch, initTitle, initLocation, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`/jobs?${params.toString()}`);
  };

  const clearAll = () => router.push("/jobs");

  const pageNumbers = (() => {
    if (!pagination) return [];
    return Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
      .filter(
        (p) =>
          p === 1 ||
          p === pagination.totalPages ||
          Math.abs(p - currentPage) <= 1,
      )
      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
        acc.push(p);
        return acc;
      }, []);
  })();

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Browse <span className="brand-text">Jobs</span>
            </h1>
            {pagination && !loading && (
              <p className="text-sm text-white/45 mt-1">
                {pagination.total} opportunit
                {pagination.total === 1 ? "y" : "ies"} found
              </p>
            )}
          </div>

          {/* Inline search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
            <input
              id="jobs-search"
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/35 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              placeholder="Quick search…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const params = new URLSearchParams(searchParams.toString());
                  if (searchInput) params.set("search", searchInput);
                  else params.delete("search");
                  params.set("page", "1");
                  router.push(`/jobs?${params.toString()}`);
                }
              }}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("search");
                  params.set("page", "1");
                  router.push(`/jobs?${params.toString()}`);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40">Filters:</span>
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-medium"
              >
                {f.label}
                <button
                  onClick={() => removeFilter(f.key)}
                  className="hover:text-white transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Results strip ── */}
        {pagination && !loading && (
          <p className="text-xs text-white/40">
            Showing{" "}
            <span className="text-white/70 font-semibold">
              {(pagination.page - 1) * LIMIT + 1}–
              {Math.min(pagination.page * LIMIT, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="text-white/70 font-semibold">
              {pagination.total}
            </span>{" "}
            jobs
          </p>
        )}

        {/* ── Job Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-destructive text-center">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 glass-card rounded-3xl">
            <Briefcase className="w-14 h-14 text-white/15" />
            <p className="text-lg font-semibold text-white/40">No jobs found</p>
            {activeFilters.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job: any) => {
              const grad = colorFromString(job.title ?? "job");
              return (
                <Link key={job.id} href={`/user/job/${job.id}`}>
                  <div className="group glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-500/35 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-11 h-11 rounded-xl bg-linear-to-br ${grad} flex items-center justify-center text-base font-extrabold text-white shadow-lg`}
                      >
                        {job.title?.charAt(0)?.toUpperCase() ?? "J"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-white group-hover:text-indigo-200 transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-xs text-white/40 mt-0.5 font-medium">
                          Full Time
                        </p>
                      </div>
                    </div>

                    <p className="text-white/50 text-sm line-clamp-2 leading-relaxed flex-1">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-white/6 text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-white/45">
                        <MapPin className="w-3.5 h-3.5 text-white/30" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salary ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-indigo-300 ml-auto">
                        <Users className="w-3.5 h-3.5" />
                        {job.vacancy} vacanc{job.vacancy === 1 ? "y" : "ies"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
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
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-white/30 text-sm"
                  >
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
                ),
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
    </div>
  );
}

// Wrap in Suspense because useSearchParams() requires it
export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}

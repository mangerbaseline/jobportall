"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hook/hook";
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { clearUser } from "@/lib/features/user/userSlice";
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

/** Deterministic color by string hash */
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
        <div className="h-4 bg-muted rounded-lg w-3/4" />
        <div className="h-3 bg-muted rounded-lg w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded-lg" />
        <div className="h-3 bg-muted rounded-lg w-5/6" />
      </div>
      <div className="flex gap-3 pt-2 border-t border-border">
        <div className="h-3 w-20 bg-muted rounded-lg" />
        <div className="h-3 w-16 bg-muted rounded-lg" />
        <div className="h-3 w-14 bg-muted rounded-lg ml-auto" />
      </div>
    </div>
  );
}

export default function UserPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (user.role === "EMPLOYER") {
      router.push("/employer");
      return;
    }
    if (user.role === "ADMIN") {
      router.push("/admin");
      return;
    }
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(LIMIT),
          search: debouncedSearch || "",
        });
        const res = await fetch(`/api/job?${params}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data.job ?? []);
        setPagination(data.pagination ?? null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [debouncedSearch, currentPage, user.loading, user.role]);

  if (user.loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Update Banner */}
        <Link
          href="/user/profile/update-profile"
          className="block w-full animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <div className="bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-primary/20 transition-colors cursor-pointer shadow-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
              i
            </span>
            <span className="text-sm font-medium text-foreground flex-1">
              Keep your profile complete and up to date. Make your chances
              higher to get a job.
            </span>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </div>
        </Link>

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Explore <span className="brand-text">Jobs</span>
            </h1>
            {pagination && !loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {pagination.total} opportunities available
                {debouncedSearch && (
                  <>
                    {" "}
                    for &quot;
                    <em className="text-primary">{debouncedSearch}</em>&quot;
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <input
                id="job-search"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/35 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Search jobs, skills, location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* User avatar */}
            <Link
              href="/user/profile"
              className="shrink-0 w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform duration-200"
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Link>
          </div>
        </div>

        {/* ── Results count strip ── */}
        {pagination && !loading && (
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="text-foreground font-semibold">
              {(pagination.page - 1) * LIMIT + 1}–
              {Math.min(pagination.page * LIMIT, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-semibold">
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
            <div className="text-destructive text-center">{error}</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 glass-card rounded-3xl">
            <Briefcase className="w-14 h-14 text-muted-foreground/15" />
            <p className="text-lg font-semibold text-muted-foreground">
              No jobs found
            </p>
            {debouncedSearch && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job: any) => {
              const grad = colorFromString(job.title ?? "job");
              return (
                <Link key={job.id} href={`/user/job/${job.id}`}>
                  <div className="group glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200">
                    {/* Card top */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-11 h-11 rounded-xl bg-linear-to-br ${grad} flex items-center justify-center text-base font-extrabold text-white shadow-lg`}
                      >
                        {job.title?.charAt(0)?.toUpperCase() ?? "J"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          Full Time
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
                      {job.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-border text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/30" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1.5 text-primary ml-auto">
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-muted-foreground/30 text-sm"
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
                        : "glass-card text-muted-foreground hover:text-foreground hover:border-primary/30"
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
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

"use client";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hook/hook";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

const LIMIT = 9;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search — reset to page 1 on new query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(LIMIT),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/job?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data.job ?? []);
      setPagination(data.pagination ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    if (user.role === "EMPLOYER") {
      router.push("/employer");
      return;
    }
    fetchJobs();
  }, [fetchJobs, user.role, router]);

  if (user.loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build smart page number list with ellipsis
  const pageNumbers = (() => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    return Array.from({ length: total }, (_, i) => i + 1)
      .filter(
        (p) => p === 1 || p === total || Math.abs(p - currentPage) <= 1
      )
      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
        acc.push(p);
        return acc;
      }, []);
  })();

  return (
    <div>
      <Navbar />
      <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-64 pl-9 border-border bg-background"
              placeholder="Search jobs, skills, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/user/profile">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* Results info */}
        {pagination && !loading && (
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(pagination.page - 1) * LIMIT + 1}–
              {Math.min(pagination.page * LIMIT, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {pagination.total}
            </span>{" "}
            jobs
            {debouncedSearch && (
              <>
                {" "}
                for &quot;
                <span className="italic">{debouncedSearch}</span>
                &quot;
              </>
            )}
          </p>
        )}

        {/* Job Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
            <Briefcase className="w-12 h-12 opacity-30" />
            <p className="text-lg font-medium">No jobs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="group p-5 border border-border rounded-2xl shadow-sm bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-3 text-xs font-semibold pt-2 border-t border-border">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <DollarSign className="w-3.5 h-3.5" />${job.salary}
                  </span>
                  <span className="ml-auto text-blue-500">
                    {job.vacancy} vacanc{job.vacancy === 1 ? "y" : "ies"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item as number)}
                    className={`w-10 h-10 rounded-xl border font-medium transition-all duration-200 ${
                      currentPage === item
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "border-border bg-card hover:bg-muted"
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
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

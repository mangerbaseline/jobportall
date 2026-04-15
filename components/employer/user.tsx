"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
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

export default function USER() {
  const [users, setUsers] = useState<UsersShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Debounce search — reset to page 1 on new query
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

  // Smart page list with ellipsis
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

  if (error) {
    return (
      <div className="h-64 w-full flex justify-center items-center text-destructive border border-dashed border-border rounded-2xl">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="w-64 pl-9 border-border bg-background"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/employer/profile">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>E</AvatarFallback>
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
          users
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

      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
          <Users className="w-12 h-12 opacity-30" />
          <p className="text-lg font-medium">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user: UsersShow) => (
            <div
              key={user.id}
              className="group p-5 border border-border rounded-2xl shadow-sm bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                {user.name}
              </h3>
              <p className="text-muted-foreground text-sm truncate">
                {user.email}
              </p>
              <div className="mt-4 flex gap-4 text-xs font-semibold pt-3 border-t border-border">
                <span className="text-blue-500">
                  Jobs: {user._count?.jobs ?? 0}
                </span>
                <span className="text-purple-500">
                  Apps: {user._count?.applications ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
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
  );
}

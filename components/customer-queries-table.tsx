"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Loader2,
  MessageSquare,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CustomerQueriesTable = () => {
  const [queries, setQueries] = useState<ContactData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<ContactData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(
        `/api/admin/contact-us?${params.toString()}`,
      );
      const result = await response.json();

      if (result.success) {
        setQueries(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQueries();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchQueries]);

  return (
    <div className="w-full space-y-6 animate-fade-up">
      {/* ── Search & Title ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Customer Submissions
        </h2>
        <div className="relative group max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="relative overflow-hidden bg-card border border-border rounded-2xl backdrop-blur-sm">
        {loading && (
          <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queries.length > 0
                ? queries.map((query) => (
                  <tr
                    key={query.id}
                    className="group hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                          {query.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {query.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {query.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground/80 line-clamp-1 max-w-62.5">
                        {query.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(query.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedQuery(query);
                          setIsDialogOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
                : !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
                        <MessageSquare className="w-12 h-12 stroke-1" />
                        <p className="text-sm">No submissions found</p>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="text-foreground">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="text-foreground">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="text-foreground">{pagination.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-all ${pagination.page === i + 1
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Query Details Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-card border border-border text-foreground p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-border bg-muted/20">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Info className="w-5 h-5 text-primary" />
              Query Details
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Customer
                </p>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20 shadow-inner">
                    {selectedQuery?.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-foreground tracking-tight">
                    {selectedQuery?.name}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Email Address
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary/50" />
                  {selectedQuery?.email}
                </div>
              </div>
              {selectedQuery?.phone && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Phone Number
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground font-medium tracking-wide">
                    {selectedQuery.phone}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Date Received
                </p>
                <p className="text-sm mt-2 text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary/50" />
                  {selectedQuery &&
                    new Date(selectedQuery.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Subject
              </p>
              <div className="p-3.5 rounded-xl bg-muted border border-border text-sm font-bold text-foreground tracking-tight leading-snug shadow-sm">
                {selectedQuery?.subject}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Message Content
              </p>
              <div className="p-5 rounded-2xl bg-muted/50 border border-border text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap min-h-35 shadow-inner font-light">
                {selectedQuery?.message}
              </div>
            </div>

            {selectedQuery?.adminNote && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-amber-400/40 uppercase tracking-widest">
                  Admin Response Note
                </p>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-sm text-amber-200/60 italic leading-relaxed">
                  &quot;{selectedQuery.adminNote}&quot;
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-muted/20 border-t border-border flex justify-end">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-6 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-all"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerQueriesTable;

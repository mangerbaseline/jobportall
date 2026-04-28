"use client";

import { useEffect, useState, useRef } from "react";
import {
  Eye,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
} from "lucide-react";

interface JobAnalytics {
  id: string;
  title: string;
  location: string;
  salary: number | null;
  vacancy: number;
  available: boolean;
  createdAt: string;
  views: number;
  applications: number;
  conversionRate: number;
}

interface AnalyticsData {
  summary: {
    totalJobs: number;
    totalViews: number;
    totalApplications: number;
    avgConversionRate: number;
    statusCounts: { pending: number; accepted: number; rejected: number };
  };
  highlights: {
    mostViewedJob: { title: string; views: number } | null;
    highestConvertingJob: { title: string; conversionRate: number } | null;
  };
  jobs: JobAnalytics[];
}

type SortField = "views" | "applications" | "conversionRate" | "createdAt";
type SortDir = "asc" | "desc";

/* ── Animated number counter ── */
function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value]);
  return (
    <>
      {display.toLocaleString()}
      {suffix}
    </>
  );
}

/* ── Mini donut chart ── */
function DonutChart({
  segments,
}: {
  segments: { value: number; color: string }[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0)
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          className="text-white/5"
        />
      </svg>
    );
  let offset = 25;
  return (
    <svg
      viewBox="0 0 36 36"
      className="w-full h-full"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        className="text-white/5"
      />
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        const el = (
          <circle
            key={i}
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke={seg.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeDashoffset={`${-offset}`}
            className="transition-all duration-1000"
          />
        );
        offset -= pct;
        return el;
      })}
    </svg>
  );
}

export default function EmployerAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<SortField>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/employer/analytics");
        const json = await res.json();
        json.success ? setData(json.data) : setError(json.message || "Failed");
      } catch {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedJobs = data?.jobs
    ? [...data.jobs].sort((a, b) => {
        const [aV, bV] =
          sortField === "createdAt"
            ? [new Date(a.createdAt).getTime(), new Date(b.createdAt).getTime()]
            : [a[sortField], b[sortField]];
        return sortDir === "asc" ? aV - bV : bV - aV;
      })
    : [];

  if (loading)
    return (
      <div className="glass-card rounded-[2rem] p-8 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white/8" />
          <div className="h-5 bg-white/8 rounded-lg w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="glass-card rounded-[2rem] p-6 border-red-500/20 text-red-400 text-sm flex items-center gap-3">
        <XCircle className="w-5 h-5 shrink-0" />{" "}
        {error || "No analytics data available"}
      </div>
    );

  const { summary, highlights } = data;
  const totalDecided =
    summary.statusCounts.accepted + summary.statusCounts.rejected;
  const acceptRate =
    totalDecided > 0
      ? Math.round((summary.statusCounts.accepted / totalDecided) * 100)
      : 0;

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <th
      onClick={() => toggleSort(field)}
      className="text-right text-[10px] font-bold text-white/40 uppercase tracking-wider p-4 cursor-pointer hover:text-white/60 transition-colors select-none"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field ? (
          sortDir === "desc" ? (
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          ) : (
            <ChevronUp className="w-3 h-3 text-indigo-400" />
          )
        ) : (
          <ChevronDown className="w-3 h-3 text-white/15" />
        )}
      </span>
    </th>
  );

  const statCards = [
    {
      icon: Eye,
      label: "Total Views",
      value: summary.totalViews,
      color: "indigo",
      glow: "shadow-indigo-500/20",
    },
    {
      icon: Users,
      label: "Applications",
      value: summary.totalApplications,
      color: "emerald",
      glow: "shadow-emerald-500/20",
    },
    {
      icon: Target,
      label: "Conversion",
      value: summary.avgConversionRate,
      suffix: "%",
      color: "violet",
      glow: "shadow-violet-500/20",
      badge:
        summary.avgConversionRate > 5
          ? {
              text: "Good",
              cls: "text-emerald-400 bg-emerald-500/10",
              icon: ArrowUpRight,
            }
          : summary.totalViews > 0
            ? {
                text: "Low",
                cls: "text-amber-400 bg-amber-500/10",
                icon: ArrowDownRight,
              }
            : null,
    },
    {
      icon: Award,
      label: "Accept Rate",
      value: acceptRate,
      suffix: "%",
      color: "sky",
      glow: "shadow-sky-500/20",
    },
  ];

  const pipelineSegments = [
    { value: summary.statusCounts.accepted, color: "#34d399" },
    { value: summary.statusCounts.pending, color: "#fbbf24" },
    { value: summary.statusCounts.rejected, color: "#f87171" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-linear-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Recruitment Analytics
            </h2>
            <p className="text-xs text-white/30">
              {summary.totalJobs} active listing
              {summary.totalJobs !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
            Live Data
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`group relative rounded-2xl p-5 bg-linear-to-br from-white/4 to-white/1 border border-white/6 hover:border-${card.color}-500/30 transition-all duration-300 hover:shadow-xl ${card.glow} overflow-hidden`}
          >
            {/* Glow orb */}
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-${card.color}-500/5 blur-2xl group-hover:bg-${card.color}-500/10 transition-all duration-500`}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2 rounded-xl bg-${card.color}-500/10 border border-${card.color}-500/20`}
                >
                  <card.icon className={`w-4 h-4 text-${card.color}-400`} />
                </div>
                {card.badge && (
                  <span
                    className={`flex items-center gap-0.5 text-[10px] font-bold ${card.badge.cls} px-2 py-0.5 rounded-full`}
                  >
                    <card.badge.icon className="w-3 h-3" /> {card.badge.text}
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                <AnimatedNumber value={card.value} suffix={card.suffix} />
              </p>
              <p className="text-[10px] text-white/35 font-semibold mt-1.5 uppercase tracking-[0.15em]">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pipeline Section ── */}
      <div className="glass-card rounded-2xl p-6 bg-linear-to-br from-white/3 to-transparent">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">
            Application Pipeline
          </h3>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut */}
          <div className="relative w-28 h-28 shrink-0">
            <DonutChart segments={pipelineSegments} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">
                {summary.totalApplications}
              </span>
              <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">
                Total
              </span>
            </div>
          </div>
          {/* Legend cards */}
          <div className="flex-1 grid grid-cols-3 gap-3 w-full">
            {[
              {
                label: "Pending",
                count: summary.statusCounts.pending,
                icon: Clock,
                color: "amber",
              },
              {
                label: "Accepted",
                count: summary.statusCounts.accepted,
                icon: CheckCircle,
                color: "emerald",
              },
              {
                label: "Rejected",
                count: summary.statusCounts.rejected,
                icon: XCircle,
                color: "red",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`p-4 rounded-xl bg-${item.color}-500/[0.06] border border-${item.color}-500/15 text-center hover:bg-${item.color}-500/10 transition-all duration-200`}
              >
                <div
                  className={`flex items-center justify-center gap-1.5 text-${item.color}-400 mb-2`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                <p className="text-2xl font-black text-white">
                  <AnimatedNumber value={item.count} />
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        {summary.totalApplications > 0 && (
          <div className="mt-5 w-full h-2.5 rounded-full bg-white/5 overflow-hidden flex">
            {pipelineSegments.map((seg, i) => (
              <div
                key={i}
                className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(seg.value / summary.totalApplications) * 100}%`,
                  backgroundColor: seg.color,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Highlights ── */}
      {(highlights.mostViewedJob || highlights.highestConvertingJob) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.mostViewedJob && (
            <div className="group glass-card rounded-2xl p-5 border-indigo-500/15 hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-2 text-indigo-400 mb-3">
                  <Eye className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                    🔥 Most Viewed
                  </span>
                </div>
                <p className="text-white font-bold truncate text-lg">
                  {highlights.mostViewedJob.title}
                </p>
                <p className="text-indigo-300/60 text-sm mt-1 font-medium">
                  {highlights.mostViewedJob.views.toLocaleString()} views
                </p>
              </div>
            </div>
          )}
          {highlights.highestConvertingJob && (
            <div className="group glass-card rounded-2xl p-5 border-emerald-500/15 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                    ⚡ Best Conversion
                  </span>
                </div>
                <p className="text-white font-bold truncate text-lg">
                  {highlights.highestConvertingJob.title}
                </p>
                <p className="text-emerald-300/60 text-sm mt-1 font-medium">
                  {highlights.highestConvertingJob.conversionRate}% conversion
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Job Performance Table ── */}
      {sortedJobs.length > 0 && (
        <div className="rounded-2xl border border-white/6 bg-linear-to-br from-white/3 to-transparent overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">
              Job Performance
            </h3>
            <span className="text-[10px] text-white/25">
              {sortedJobs.length} job{sortedJobs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider p-4">
                    Job Title
                  </th>
                  <SortBtn field="views" label="Views" />
                  <SortBtn field="applications" label="Apps" />
                  <SortBtn field="conversionRate" label="Conv. Rate" />
                  <th className="text-right text-[10px] font-bold text-white/40 uppercase tracking-wider p-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedJobs.map((job, idx) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/3 hover:bg-white/2.5 transition-colors"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="p-4">
                      <span className="text-sm font-semibold text-white truncate block max-w-[280px]">
                        {job.title}
                      </span>
                      <span className="text-xs text-white/25 mt-0.5 block">
                        {job.location}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-white/80 tabular-nums">
                        {job.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-white/80 tabular-nums">
                        {job.applications}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="w-20 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              job.conversionRate >= 10
                                ? "bg-linear-to-r from-emerald-500 to-emerald-400"
                                : job.conversionRate >= 5
                                  ? "bg-linear-to-r from-indigo-500 to-indigo-400"
                                  : job.conversionRate > 0
                                    ? "bg-linear-to-r from-amber-500 to-amber-400"
                                    : "bg-white/10"
                            }`}
                            style={{
                              width: `${Math.min(job.conversionRate * 2, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold tabular-nums min-w-[3ch] text-right ${
                            job.conversionRate >= 10
                              ? "text-emerald-400"
                              : job.conversionRate >= 5
                                ? "text-indigo-400"
                                : job.conversionRate > 0
                                  ? "text-amber-400"
                                  : "text-white/25"
                          }`}
                        >
                          {job.conversionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          job.available
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-white/5 text-white/25 border border-white/10"
                        }`}
                      >
                        {job.available && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {job.available ? "Active" : "Closed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden p-4 space-y-3">
            {sortedJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">
                      {job.location}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      job.available
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {job.available ? "Active" : "Closed"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "Views", v: job.views, c: "text-white" },
                    { l: "Apps", v: job.applications, c: "text-white" },
                    {
                      l: "Conv.",
                      v: `${job.conversionRate}%`,
                      c:
                        job.conversionRate >= 10
                          ? "text-emerald-400"
                          : job.conversionRate >= 5
                            ? "text-indigo-400"
                            : "text-amber-400",
                    },
                  ].map((m) => (
                    <div
                      key={m.l}
                      className="text-center p-2 rounded-lg bg-white/2"
                    >
                      <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">
                        {m.l}
                      </p>
                      <p className={`text-sm font-bold mt-0.5 ${m.c}`}>{m.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

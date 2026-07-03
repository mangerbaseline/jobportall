"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hook/hook";
import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MapPin,
  DollarSign,
  ArrowLeft,
  Building,
} from "lucide-react";
import Link from "next/link";
import GradientBlobs from "@/components/bg/gradientblobs";

interface Application {
  id: string;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    salary: number | null;
  };
  jobTitle?: string;
}

function StatusPipeline({ status }: { status: Application["status"] }) {
  const steps = [
    { id: "applied", label: "Applied", icon: Clock },
    { id: "reviewed", label: "Reviewed", icon: Eye },
    { id: "outcome", label: status === "REJECTED" ? "Rejected" : "Accepted", icon: status === "REJECTED" ? XCircle : CheckCircle2 },
  ];

  let currentStepIndex = 0;
  if (status === "REVIEWED") currentStepIndex = 1;
  if (status === "ACCEPTED" || status === "REJECTED") currentStepIndex = 2;

  return (
    <div className="flex items-center w-full max-w-sm mt-4">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;
        const isPending = idx > currentStepIndex;
        
        let colorClass = "text-muted-foreground border-muted-foreground/30 bg-muted";
        if (isCompleted || (isCurrent && status === "ACCEPTED")) {
          colorClass = "text-emerald-500 border-emerald-500 bg-emerald-500/10";
        } else if (isCurrent && status === "REJECTED") {
          colorClass = "text-rose-500 border-rose-500 bg-rose-500/10";
        } else if (isCurrent) {
          colorClass = "text-primary border-primary bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.3)]";
        }

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${colorClass}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-5 w-max ${isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground/50"}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 -mt-7 bg-muted-foreground/20">
                <div 
                  className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-transparent w-0"}`} 
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-5 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-32 bg-muted rounded-lg" />
        </div>
        <div className="h-8 w-24 bg-muted rounded-full" />
      </div>
      <div className="h-12 w-full max-w-sm bg-muted rounded-lg mt-2" />
    </div>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED">("ALL");

  useEffect(() => {
    if (user.loading) return;
    if (!user.id || user.role !== "USER") {
      router.push("/auth/signin");
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const tokenRes = await fetch("/api/auth/token");
        const { token } = await tokenRes.json();
        if (!token) return;

        const res = await fetch(`/api/user/jobs`, {
          headers: { token },
        });
        const data = await res.json();
        if (data.applications) {
          // Sort by newest first
          const sorted = data.applications.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setApplications(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user.id, user.loading, user.role]);

  if (user.loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
      </div>
    );
  }

  const filteredApps = applications.filter(app => filter === "ALL" || app.status === filter);

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/user"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                My <span className="brand-text">Applications</span>
              </h1>
            </div>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                You have applied to {applications.length} position{applications.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 hide-scrollbar gap-2">
            {["ALL", "PENDING", "REVIEWED", "ACCEPTED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  filter === tab
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <ApplicationSkeleton key={i} />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-3xl">
            <CheckCircle2 className="w-16 h-16 text-muted-foreground/20" />
            <h3 className="text-xl font-bold text-foreground">No applications found</h3>
            <p className="text-muted-foreground text-sm max-w-sm text-center">
              {filter === "ALL" 
                ? "You haven't applied to any jobs yet. Start exploring opportunities!" 
                : `You don't have any applications with a ${filter.toLowerCase()} status.`}
            </p>
            {filter !== "ALL" && (
              <button 
                onClick={() => setFilter("ALL")}
                className="mt-2 text-primary text-sm font-bold hover:underline"
              >
                View all applications
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredApps.map((app) => (
              <div key={app.id} className="glass-card rounded-2xl p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  <div className="flex-1 space-y-1">
                    <Link href={`/user/job/${app.job.id}`} className="inline-block group">
                      <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {app.jobTitle || app.job.title}
                        <ArrowLeft className="w-4 h-4 rotate-135 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      </h2>
                    </Link>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 opacity-70" />
                        {app.job.location}
                      </span>
                      {app.job.salary && (
                        <span className="flex items-center gap-1.5 text-emerald-500/80">
                          <DollarSign className="w-4 h-4 opacity-70" />
                          {app.job.salary.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 opacity-70">
                        Applied {new Date(app.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="pt-8 pb-4">
                      <StatusPipeline status={app.status} />
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      app.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      app.status === "REVIEWED" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      app.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    }`}>
                      {app.status}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

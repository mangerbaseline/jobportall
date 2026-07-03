"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hook/hook";
import { useEffect, useState } from "react";
import {
  Loader2,
  Bookmark,
  MapPin,
  DollarSign,
  Users,
  Trash2,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import GradientBlobs from "@/components/bg/gradientblobs";

interface SavedJobItem {
  id: string; // SavedJob record id
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary: number | null;
    vacancy: number;
    createdAt: string;
    available: boolean;
    tags: string[];
  };
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

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 h-14 bg-muted rounded-xl" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-4 bg-muted rounded-lg w-1/2" />
          <div className="h-3 bg-muted rounded-lg w-1/4" />
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-3 bg-muted rounded-lg" />
        <div className="h-3 bg-muted rounded-lg w-5/6" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-border">
        <div className="h-3 w-24 bg-muted rounded-lg" />
        <div className="h-3 w-20 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export default function SavedJobsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user.loading) return;
    if (!user.id || user.role !== "USER") {
      router.push("/auth/signin");
      return;
    }

    const fetchSavedJobs = async () => {
      setLoading(true);
      try {
        const tokenRes = await fetch("/api/auth/token");
        const { token } = await tokenRes.json();
        if (!token) return;

        const res = await fetch(`/api/user/jobs/saved/${user.id}`, {
          headers: { token },
        });
        const data = await res.json();
        if (data.success) {
          setSavedJobs(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch saved jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [user.id, user.loading, user.role]);

  const handleUnsave = async (savedJobId: string, jobTitle: string) => {
    setRemovingId(savedJobId);
    try {
      const tokenRes = await fetch("/api/auth/token");
      const { token } = await tokenRes.json();

      const res = await fetch(`/api/user/jobs/save/${savedJobId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (data.success) {
        setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
        toast.success(`Removed "${jobTitle}" from saved jobs`);
      } else {
        toast.error("Failed to remove job");
      }
    } catch {
      toast.error("Failed to remove job");
    } finally {
      setRemovingId(null);
    }
  };

  if (user.loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back link */}
        <Link
          href="/user"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Saved <span className="brand-text">Jobs</span>
            </h1>
          </div>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 glass-card rounded-3xl">
            <Bookmark className="w-14 h-14 text-muted-foreground/15" />
            <p className="text-lg font-semibold text-muted-foreground">
              No saved jobs yet
            </p>
            <p className="text-sm text-muted-foreground/60">
              Browse jobs and tap the bookmark icon to save them here.
            </p>
            <Link
              href="/user"
              className="mt-2 px-6 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savedJobs.map((item) => {
              const job = item.job;
              const grad = colorFromString(job.title ?? "job");
              return (
                <div
                  key={item.id}
                  className="group glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <Link href={`/user/job/${job.id}`} className="shrink-0">
                      <div
                        className={`w-14 h-14 rounded-xl bg-linear-to-br ${grad} flex items-center justify-center text-xl font-extrabold text-white shadow-lg`}
                      >
                        {job.title?.charAt(0)?.toUpperCase() ?? "J"}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/job/${job.id}`}>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground font-medium">
                          Full Time
                        </span>
                        {!job.available && (
                          <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unsave button */}
                    <button
                      onClick={() => handleUnsave(item.id, job.title)}
                      disabled={removingId === item.id}
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                      title="Remove from saved"
                    >
                      {removingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <Link href={`/user/job/${job.id}`}>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </Link>

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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

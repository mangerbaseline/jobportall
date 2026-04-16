"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ResumeUploader from "@/components/user/resume";

interface Job {
  id: string;
  title: string;
  vacancy: number;
  description: string;
  location: string;
  salary: number;
  createdAt: string;
  available: boolean;
  employerId: string;
  name: string;
  applied?: boolean;
}

type FetchStatus = "idle" | "loading" | "success" | "error";
type ApplyStatus = "idle" | "loading" | "success" | "error";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

/* ─── Loading skeleton ─── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-800 rounded-full" />
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-20 bg-slate-800 rounded-full" />
              <div className="h-6 w-2/3 bg-slate-800 rounded-lg" />
              <div className="h-3 w-28 bg-slate-800 rounded-full" />
            </div>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-28 bg-slate-800 rounded-lg" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-slate-800 rounded" />
            <div className="h-4 w-4/6 bg-slate-800 rounded" />
          </div>
          <div className="h-12 w-full bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Error state ─── */
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-white font-bold text-lg mb-2 tracking-tight">
          Failed to load job
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          Try again
        </button>
        <Link
          href="/users"
          className="block mt-3 text-slate-500 hover:text-slate-400 text-sm transition-colors"
        >
          ← Back to all jobs
        </Link>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function JobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchError, setFetchError] = useState("");

  const [applyStatus, setApplyStatus] = useState<ApplyStatus>("idle");
  const [applyError, setApplyError] = useState("");
  const [showResumeUploader, setShowResumeUploader] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const loadJob = async () => {
    if (!id) {
      setFetchError("No job ID was found in the URL.");
      setFetchStatus("error");
      return;
    }
    setFetchStatus("loading");
    setFetchError("");
    try {
      const res = await fetch(`/api/job/${id}`);
      if (!res.ok) {
        const msgs: Record<number, string> = {
          404: "This job listing no longer exists.",
          403: "You don't have permission to view this job.",
          500: "Server error. Please try again later.",
        };
        throw new Error(
          msgs[res.status] ?? `Unexpected error (${res.status}).`,
        );
      }
      const json = await res.json();
      console.log(json);
      if (!json.success || !json.data)
        throw new Error("Invalid response from server.");
      setJob(json.data);
      setFetchStatus("success");
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      setFetchStatus("error");
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  const handleApplyClick = () => {
    setShowResumeUploader(true);
  };

  const handleFileUpload = (file: File | null) => {
    if (file) {
      console.log("File selected:", file.name);
      setResumeFile(file);
    } else {
      console.log("File removed");
      setResumeFile(null);
    }
  };

  const handleSubmitApplication = async () => {
    if (!resumeFile) {
      setApplyError("Please upload your resume before submitting.");
      return;
    }

    setApplyStatus("loading");
    setApplyError("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobId", id || "");

      const response = await fetch("/api/application", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setApplyStatus("success");
        setShowResumeUploader(false);
        setResumeFile(null);
        console.log("Application submitted successfully");
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : "Failed to submit application",
      );
      setApplyStatus("error");
    }
  };

  const handleCancelApplication = () => {
    setShowResumeUploader(false);
    setResumeFile(null);
    setApplyError("");
  };

  /* ── Render states ── */
  if (fetchStatus === "idle" || fetchStatus === "loading")
    return <LoadingSkeleton />;
  if (fetchStatus === "error")
    return <ErrorState message={fetchError} onRetry={loadJob} />;
  if (!job) return null;

  const initials = job.title
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-20">
      {/* Back link */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link
          href="/user"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          All Jobs
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* ── Main card ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-emerald-900/40">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.available ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950 border border-emerald-800/60 text-xs font-semibold px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Actively Hiring
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-950 border border-rose-800/60 text-xs font-semibold px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Position Closed
                    </span>
                  )}
                  {job.vacancy > 0 && (
                    <span className="text-sky-400 bg-sky-950 border border-sky-800/60 text-xs font-semibold px-3 py-1 rounded-full">
                      {job.vacancy} opening{job.vacancy > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black tracking-tight text-white leading-tight mb-1">
                  {job.title.trim()}
                </h1>
                <h3 className="text-slate-500">Company : {job.name}</h3>
                <p className="text-slate-500 text-xs">
                  Posted {timeAgo(job.createdAt)}
                </p>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/50 text-slate-300 text-sm px-4 py-2 rounded-lg">
                <svg
                  className="w-4 h-4 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {job.location}
              </div>

              <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/50 text-slate-300 text-sm px-4 py-2 rounded-lg">
                <svg
                  className="w-4 h-4 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ${job.salary} Month
              </div>

              <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/50 text-slate-300 text-sm px-4 py-2 rounded-lg">
                <svg
                  className="w-4 h-4 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                Full‑time
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                About this role
              </h2>
              <p className="text-slate-300 leading-relaxed text-[0.95rem]">
                {job.description}
              </p>
            </div>

            {/* Apply section */}
            <div className="pt-6 border-t border-slate-800">
              {!job.available ? (
                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
                  <svg
                    className="w-5 h-5 text-slate-500 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <p className="text-slate-400 text-sm">
                    This position is no longer accepting applications.
                  </p>
                </div>
              ) : job.applied || applyStatus === "success" ? (
                <div className="space-y-4">
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide
                      bg-slate-800 text-slate-500 cursor-not-allowed
                      border border-slate-700
                      flex items-center justify-center gap-2"
                  >
                    Already Applied
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <div className="flex items-start gap-3 bg-emerald-950/30 border border-emerald-800/30 rounded-xl px-5 py-4">
                    <p className="text-emerald-400 text-sm">
                      Already applied, please wait for the Company response.
                    </p>
                  </div>
                </div>
              ) : showResumeUploader ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Upload Your Resume
                    </h3>
                    <ResumeUploader
                      id={`resume-${job.id}`}
                      onFileSelect={handleFileUpload}
                    />

                    {applyError && (
                      <div className="mt-4 flex items-start gap-3 bg-rose-950 border border-rose-800/50 rounded-xl px-4 py-3">
                        <svg
                          className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                          />
                        </svg>
                        <p className="text-rose-400 text-sm">{applyError}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitApplication}
                      disabled={applyStatus === "loading" || !resumeFile}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm tracking-wide
                        bg-gradient-to-r from-emerald-500 to-teal-500
                        hover:from-emerald-400 hover:to-teal-400
                        disabled:opacity-50 disabled:cursor-not-allowed
                        text-slate-950 transition-all duration-200
                        shadow-lg shadow-emerald-900/30
                        flex items-center justify-center gap-2"
                    >
                      {applyStatus === "loading" ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>

                    <button
                      onClick={handleCancelApplication}
                      disabled={applyStatus === "loading"}
                      className="px-6 py-3.5 rounded-xl font-bold text-sm
                        bg-slate-800 hover:bg-slate-700
                        text-slate-300 transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {applyStatus === "error" && (
                    <div className="flex items-start gap-3 bg-rose-950 border border-rose-800/50 rounded-xl px-4 py-3 mb-4">
                      <svg
                        className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      <p className="text-rose-400 text-sm">{applyError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleApplyClick}
                    className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide
                      bg-gradient-to-r from-emerald-500 to-teal-500
                      hover:from-emerald-400 hover:to-teal-400
                      text-slate-950 transition-all duration-200
                      shadow-lg shadow-emerald-900/30
                      flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>

                  <p className="text-center text-slate-600 text-xs mt-3">
                    Takes less than 2 minutes.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-700 text-xs pb-6">
          Job ID: {job.id}
        </p>
      </div>
    </div>
  );
}

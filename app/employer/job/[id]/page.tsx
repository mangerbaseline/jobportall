"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import JobDetailsCard from "@/components/employer/JobDetailsCard";
import ApplicationsList from "@/components/employer/ApplicationsList";
import { Loader2 } from "lucide-react";

interface JOB_DATA {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number | null;
  vacancy: number;
  createdAt: string;
  applications: any[];
}

function JOB() {
  const { id } = useParams();
  const [job, setJob] = useState<JOB_DATA | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchJob() {
      try {
        setLoading(true);
        const res = await fetch(`/api/job/applications/${id}`);
        if (!res.ok) throw new Error("Failed to fetch job");

        const body = await res.json();
        if (body.success) {
          setJob(body.data);
        }
      } catch (error) {
        console.error("error in fetching", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-white/40 font-medium animate-pulse text-sm">
          Fetching job details...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-8 glass-card rounded-3xl text-center">
          <h2 className="text-xl font-bold text-white mb-2">Job Not Found</h2>
          <p className="text-white/40 text-sm">
            The job listing you are looking for does not exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-4 px-4 py-12 space-y-12 animate-in fade-in duration-700">
      {/* 1. Job Details with Update Option */}
      <section>
        <JobDetailsCard job={job} />
      </section>

      {/* 2. Applications from Users */}
      <section>
        <ApplicationsList applications={job.applications} />
      </section>
    </div>
  );
}

export default JOB;

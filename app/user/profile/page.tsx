"use client";
import { useAppSelector, useAppDispatch } from "@/lib/hook/hook";
import React, { useEffect } from "react";
import { fetchUserDetail } from "@/lib/features/user/profileDetail";
import {
  User,
  CheckCircle,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  XCircle,
  Loader2,
  Phone,
  Globe,
  GraduationCap,
  Award,
  PlusCircle,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { data, loading, error } = useAppSelector((state) => state.details);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserDetail(user.id));
    }
  }, [user?.id, dispatch]);

  if (loading) {
    return (
      <div className="mt-20 flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 flex justify-center items-center h-64 text-destructive">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-20 flex justify-center items-center h-64 text-muted-foreground">
        <p>No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-20 p-6 space-y-8 animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center shrink-0 border-4 border-background shadow-sm">
          <User className="w-16 h-16 text-muted-foreground" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {data.name || "Unknown User"}
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm mt-1">
              {data.role}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            {data.verified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Not Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Personal & Professional Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Details
            </h2>
            {(!data.personal || data.personal.length === 0) && (
              <Link
                href="/user/personal/new"
                className="text-sm flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                Add Details
              </Link>
            )}
          </div>

          {data.personal && data.personal.length > 0 ? (
            <div className="space-y-4 flex-1">
              {data.personal[0].bio && (
                <div className="text-muted-foreground text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                  {data.personal[0].bio}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {data.personal[0].phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="text-sm font-medium">
                        {data.personal[0].phone}
                      </p>
                    </div>
                  </div>
                )}
                {(data.personal[0].city || data.personal[0].country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Location
                      </p>
                      <p className="text-sm font-medium">
                        {[
                          data.personal[0].city,
                          data.personal[0].state,
                          data.personal[0].country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {data.personal[0].website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Website
                      </p>
                      <a
                        href={
                          data.personal[0].website.startsWith("http")
                            ? data.personal[0].website
                            : `https://${data.personal[0].website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate block max-w-[150px]"
                      >
                        {data.personal[0].website}
                      </a>
                    </div>
                  </div>
                )}
                {data.personal[0].dob && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Date of Birth
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(data.personal[0].dob).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
              <User className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                No personal details provided yet.
              </p>
            </div>
          )}
        </div>

        {/* Professional Details */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Professional Details
            </h2>
            {(!data.professional || data.professional.length === 0) && (
              <Link
                href="/user/professional/new"
                className="text-sm flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                Add Details
              </Link>
            )}
          </div>

          {data.professional && data.professional.length > 0 ? (
            <div className="space-y-5 flex-1">
              <div className="pb-4 border-b border-border">
                <h3 className="font-bold text-lg">
                  {data.professional[0].title || "Professional Title"}
                </h3>
                {data.professional[0].company && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {data.professional[0].company}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.professional[0].experience !== null && (
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Experience
                      </p>
                      <p className="text-sm font-medium">
                        {data.professional[0].experience} Years
                      </p>
                    </div>
                  </div>
                )}
                {data.professional[0].skills && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Skills
                      </p>
                      <p
                        className="text-sm font-medium truncate max-w-[150px]"
                        title={data.professional[0].skills}
                      >
                        {data.professional[0].skills}
                      </p>
                    </div>
                  </div>
                )}
                {data.professional[0].education && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Education
                      </p>
                      <p className="text-sm font-medium line-clamp-2">
                        {data.professional[0].education}
                      </p>
                    </div>
                  </div>
                )}
                {(data.professional[0].currentSalary !== null ||
                  data.professional[0].expectedSalary !== null) && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Salary Stats
                      </p>
                      <p className="text-sm font-medium">
                        {data.professional[0].currentSalary &&
                          `Current: $${data.professional[0].currentSalary} `}
                        {data.professional[0].expectedSalary &&
                          `| Expected: $${data.professional[0].expectedSalary}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
              <Briefcase className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                No professional details provided yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              Total Jobs
            </p>
            <p className="text-2xl font-bold">{data._count?.jobs || 0}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              Total Applications
            </p>
            <p className="text-2xl font-bold">
              {data._count?.applications || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      {data.jobs && data.jobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.jobs.map((job) => (
              <div
                key={job.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3
                  className="text-lg font-semibold truncate"
                  title={job.title}
                >
                  {job.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>
                      {job.vacancy} Vacanc{job.vacancy === 1 ? "y" : "ies"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-medium text-xs">
                      {job._count?.applications || 0} applications
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

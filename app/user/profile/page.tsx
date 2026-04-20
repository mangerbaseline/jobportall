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
  ChevronRight,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";

export default function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { data, loading, error } = useAppSelector((state) => state.details);
  const [showApplications, setShowApplications] = React.useState(false);
  console.log("data : ", data);

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
      {/* Profile Update Banner */}
      <Link href="/user/profile/update-profile" className="block w-full">
        <div className="bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-primary/20 transition-colors cursor-pointer shadow-sm">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-bold shrink-0 text-xs">
            i
          </span>
          <span className="text-sm font-medium text-primary flex-1">
            Keep your profile complete and up to date. Make your chances higher
            to get a job.
          </span>
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
        </div>
      </Link>

      {/* Profile Header Card */}
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center shrink-0 border-4 border-background shadow-sm relative overflow-hidden">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "User avatar"}
              fill
              className="object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-muted-foreground" />
          )}
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
        {!data.personal ? (
          <Link
            href="/user/profile/update-profile"
            className="text-sm flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Add Details
          </Link>
        ) : (
          <Link
            href="/user/profile/update-profile"
            className="text-sm flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Update Details
          </Link>
        )}
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
          </div>

          {data.personal ? (
            <div className="space-y-4 flex-1">
              {data.personal.bio && (
                <div className="text-muted-foreground text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                  {data.personal.bio}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {data.personal.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="text-sm font-medium">
                        {data.personal.phone}
                      </p>
                    </div>
                  </div>
                )}
                {(data.personal.city || data.personal.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Location
                      </p>
                      <p className="text-sm font-medium">
                        {[
                          data.personal.city,
                          data.personal.state,
                          data.personal.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {data.personal.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Website
                      </p>
                      <Link
                        href={
                          data.personal.website.startsWith("http")
                            ? data.personal.website
                            : `https://${data.personal.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate block max-w-[150px]"
                      >
                        {data.personal.website}
                      </Link>
                    </div>
                  </div>
                )}
                {data.personal.dob && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Date of Birth
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(data.personal.dob).toLocaleDateString()}
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
          </div>

          {data.professional ? (
            <div className="space-y-5 flex-1">
              <div className="pb-4 border-b border-border">
                <h3 className="font-bold text-lg">
                  {data.professional.title || "Professional Title"}
                </h3>
                {data.professional.company && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {data.professional.company}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.professional.experience !== null && (
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Experience
                      </p>
                      <p className="text-sm font-medium">
                        {data.professional.experience} Years
                      </p>
                    </div>
                  </div>
                )}
                {data.professional.skills && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Skills
                      </p>
                      <p
                        className="text-sm font-medium truncate max-w-[150px]"
                        title={data.professional.skills}
                      >
                        {data.professional.skills}
                      </p>
                    </div>
                  </div>
                )}
                {data.professional.education && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Education
                      </p>
                      <p className="text-sm font-medium line-clamp-2">
                        {data.professional.education}
                      </p>
                    </div>
                  </div>
                )}
                {(data.professional.currentSalary !== null ||
                  data.professional.expectedSalary !== null) && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Salary Stats
                      </p>
                      <p className="text-sm font-medium">
                        {data.professional.currentSalary &&
                          `Current: $${data.professional.currentSalary} `}
                        {data.professional.expectedSalary &&
                          `| Expected: $${data.professional.expectedSalary}`}
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
              Total Offers
            </p>
            <p className="text-2xl font-bold">{data._count?.jobs || 0}</p>
          </div>
        </div>

        <div 
          onClick={() => setShowApplications(true)}
          className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors group"
        >
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">
              Total Applications
            </p>
            <p className="text-2xl font-bold">
              {data._count?.applications || 0}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Applications Dialog */}
      <Dialog open={showApplications} onOpenChange={setShowApplications}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Your Applications
            </DialogTitle>
            <DialogDescription>
              View the status of all jobs you have applied for.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {data.applications && data.applications.length > 0 ? (
              data.applications.map((app: any) => (
                <div 
                  key={app.id}
                  className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg leading-tight">{app.job.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span>{app.employer.companyName || app.employer.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === "PENDING" 
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : app.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {app.status}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-primary">
                        <DollarSign className="w-4 h-4" />
                        {app.job.salary}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                <p className="text-muted-foreground">You haven&apos;t applied for any jobs yet.</p>
                <Link 
                  href="/user" 
                  className="inline-block text-primary font-medium hover:underline"
                  onClick={() => setShowApplications(false)}
                >
                  Browse available jobs
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

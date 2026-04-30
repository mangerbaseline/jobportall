import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ApplicantProfileDialogProps {
  children: React.ReactNode;
  applicationId: string;
  basicData: {
    name: string;
    email: string;
    createdAt: string;
    resumeUrl: string;
  };
}

export default function ApplicantProfileDialog({
  children,
  applicationId,
  basicData,
}: ApplicantProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [fullData, setFullData] = useState<any>(null);

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !fullData && !loading) {
      try {
        setLoading(true);
        const res = await fetch(`/api/application/${applicationId}`);
        if (!res.ok) throw new Error("Failed to fetch application details");
        const body = await res.json();
        if (body.success) {
          setFullData(body.application);
        }
      } catch (err) {
        console.error("Error fetching applicant details:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusUpdate = async (status?: string) => {
    try {
      setUpdating(true);
      const options: RequestInit = {
        method: "POST",
      };

      if (status) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({ status });
      }

      const res = await fetch(
        `/api/application/accept/${applicationId}`,
        options,
      );
      const data = await res.json();

      if (data.success) {
        toast.success(`Application ${status || "REJECTED"} successfully`);
        // Update local state with the new application data
        setFullData(data.application || data.data);
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("An error occurred while updating status");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const professional = fullData?.user?.professional;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Applicant Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Applied on {new Date(basicData.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Basic Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
              {basicData.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-semibold">{basicData.name}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> {basicData.email}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">
                Loading professional details...
              </p>
            </div>
          ) : (
            <>
              {/* Professional Details */}
              {professional ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <h4 className="text-lg font-semibold border-b border-border pb-2">
                    Professional Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {professional.title && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Current Title
                        </span>
                        <p className="font-medium">{professional.title}</p>
                      </div>
                    )}
                    {professional.company && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Current Company
                        </span>
                        <p className="font-medium">{professional.company}</p>
                      </div>
                    )}
                    {professional.experience !== null &&
                      professional.experience !== undefined && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Experience
                          </span>
                          <p className="font-medium">
                            {professional.experience} years
                          </p>
                        </div>
                      )}
                  </div>

                  {professional.skills && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        Skills
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {professional.skills
                          .split(",")
                          .map((skill: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs border border-primary/20"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {professional.education && (
                    <div className="space-y-1 pt-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        Education
                      </span>
                      <p className="text-sm bg-muted p-3 rounded-lg border border-border">
                        {professional.education}
                      </p>
                    </div>
                  )}

                  {/* Links */}
                  {(professional.linkedin ||
                    professional.github ||
                    professional.portfolio) && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        Links
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {professional.linkedin && (
                          <a
                            href={professional.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        )}
                        {professional.github && (
                          <a
                            href={professional.github}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                        {professional.portfolio && (
                          <Link
                            href={professional.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Portfolio
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted border border-border text-center text-muted-foreground">
                  <p>No professional details provided by the applicant.</p>
                </div>
              )}

              {/* Status Helper Message */}
              {fullData?.status && fullData.status !== "PENDING" && (
                <div
                  className={`mt-6 p-3 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 ${
                    fullData.status === "ACCEPTED"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  <div className="relative flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        fullData.status === "ACCEPTED"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        fullData.status === "ACCEPTED"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    ></span>
                  </div>
                  <p className="text-[13px] font-medium leading-tight">
                    This application is currently{" "}
                    <span className="font-bold uppercase tracking-wider">
                      {fullData.status}
                    </span>
                    .
                    <br />
                    <span className="text-muted-foreground font-normal">
                      To change this decision, click the{" "}
                      <span
                        className={
                          fullData.status === "ACCEPTED"
                            ? "text-rose-500"
                            : "text-emerald-500"
                        }
                      >
                        {fullData.status === "ACCEPTED" ? "Reject" : "Accept"}
                      </span>{" "}
                      button below.
                    </span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className={`${fullData?.status && fullData.status !== "PENDING" ? "pt-4" : "pt-6"} border-t border-border flex flex-col sm:flex-row justify-end animate-in fade-in slide-in-from-bottom-4 duration-500 gap-3 mt-4`}
              >
                <Link
                  href={fullData?.resumeUrl || basicData.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-muted hover:bg-accent text-foreground font-medium transition-all border border-border w-full sm:w-auto order-2 sm:order-1"
                >
                  <FileText className="w-4 h-4" />
                  View Resume
                  <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                </Link>

                <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                  {fullData?.status !== "REJECTED" && (
                    <button
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 font-medium transition-all"
                      onClick={() => handleStatusUpdate()}
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  )}
                  {fullData?.status !== "ACCEPTED" && (
                    <button
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg shadow-emerald-600/20"
                      onClick={() => handleStatusUpdate("ACCEPTED")}
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Accept
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React from "react";
import { 
  User, 
  Mail, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  createdAt: string;
  resumeUrl: string;
  user: {
    name: string;
    email: string;
  };
}

interface ApplicationsListProps {
  applications: Application[];
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ACCEPTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-3.5 h-3.5" />,
  ACCEPTED: <CheckCircle2 className="w-3.5 h-3.5" />,
  REJECTED: <XCircle className="w-3.5 h-3.5" />,
};

export default function ApplicationsList({ applications }: ApplicationsListProps) {
  if (!applications || applications.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 border-dashed">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <User className="w-8 h-8 text-white/20" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-white">No Applications Yet</h4>
          <p className="text-white/40 text-sm max-w-xs">
            As soon as candidates start applying, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-1.5 h-6 rounded-full bg-indigo-500" />
          Received Applications
          <span className="ml-2 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs">
            {applications.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {applications.map((app) => (
          <div 
            key={app.id} 
            className="group glass-card rounded-2xl p-6 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {app.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {app.user.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Mail className="w-3.5 h-3.5 text-white/20" />
                      {app.user.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/40 border-l border-white/10 pl-3">
                      <Clock className="w-3.5 h-3.5 text-white/20" />
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center flex-wrap gap-4">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${statusStyles[app.status] || statusStyles.PENDING}`}>
                  {statusIcons[app.status] || statusIcons.PENDING}
                  {app.status}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Resume
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                  
                  {/* Link to full application details if needed */}
                  {/* <Link
                    href={`/employer/application/${app.id}`}
                    className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link> */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Binoculars, Briefcase, ArrowRight } from "lucide-react";

interface CardHome {
  seek?: string;
  postJob?: string;
  link?: string;
}

export function HomeCard({ seek, postJob, link }: CardHome) {
  const isSeeker = !!seek;

  return (
    <Link href={link || ""} className="group flex-1 min-w-[260px] max-w-sm">
      <div
        className={`relative overflow-hidden h-full rounded-3xl border transition-all duration-300 p-8 flex flex-col items-start gap-6 cursor-pointer
          ${
            isSeeker
              ? "bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 border-indigo-500/25 hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/20"
              : "bg-gradient-to-br from-violet-600/20 to-violet-900/20 border-violet-500/25 hover:border-violet-400/50 hover:shadow-2xl hover:shadow-violet-500/20"
          }
          hover:-translate-y-1
        `}
      >
        {/* Background glow orb */}
        <div
          className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-300 group-hover:opacity-50
            ${isSeeker ? "bg-indigo-500" : "bg-violet-500"}
          `}
        />

        {/* Icon */}
        <div
          className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:animate-float
            ${
              isSeeker
                ? "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/40"
                : "bg-gradient-to-br from-violet-500 to-violet-700 shadow-violet-500/40"
            }
          `}
        >
          {isSeeker ? (
            <Binoculars className="w-8 h-8 text-white" />
          ) : (
            <Briefcase className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1">
          <h3
            className={`text-2xl font-bold mb-2 ${
              isSeeker ? "text-indigo-100" : "text-violet-100"
            }`}
          >
            {isSeeker ? "Find Jobs" : "Post Jobs"}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {isSeeker
              ? "Browse thousands of curated opportunities matched to your skills and ambitions."
              : "Reach top talent instantly. Post openings and manage your hiring pipeline."}
          </p>
        </div>

        {/* CTA */}
        <div
          className={`relative z-10 flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3
            ${isSeeker ? "text-indigo-300" : "text-violet-300"}
          `}
        >
          {isSeeker ? "Browse Jobs" : "Post a Job"}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

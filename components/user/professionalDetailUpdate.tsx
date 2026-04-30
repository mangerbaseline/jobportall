"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Briefcase,
  GraduationCap,
  Award,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileText,
} from "lucide-react";

type ProfessionalDetailsFormData = {
  title: string;
  companyName: string;
  experience: number | "";
  skills: string;
  education: string;
  certifications: string;
  currentSalary: number | "";
  expectedSalary: number | "";
  noticePeriod: number | "";
  resume: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

const ProfessionalDetailsForm = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfessionalDetailsFormData>({
    defaultValues: {
      title: "",
      companyName: "",
      experience: "",
      skills: "",
      education: "",
      certifications: "",
      currentSalary: "",
      expectedSalary: "",
      noticePeriod: "",
      resume: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
  });

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const response = await fetch("/api/user/profesionaldetail");
        const json = await response.json();
        if (json.success && json.data && json.data.length > 0) {
          const existing = json.data[0];
          Object.keys(existing).forEach((key) => {
            if (existing[key] !== null && existing[key] !== undefined) {
              setValue(key as keyof ProfessionalDetailsFormData, existing[key]);
            }
          });
        }
      } catch (err) {
        console.error("Error fetching professional details:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchExisting();
  }, [setValue]);

  const onSubmit = async (data: ProfessionalDetailsFormData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profesionaldetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to save details");

      setSuccess("Your professional profile has been updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Loading professional details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            Professional Details
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-lg">
            Highlight your career milestones, skills, and professional links to
            attract top opportunities.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Work Overview Header */}
            <div className="md:col-span-2 pb-2">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-2 opacity-50">
                Work Overview
              </h4>
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <Briefcase className="w-3 h-3 text-primary/60" /> Job Title
              </label>
              <input
                {...register("title")}
                type="text"
                placeholder="Software Engineer"
                className="w-full h-12 bg-muted border border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <Briefcase className="w-3 h-3 text-primary/60" /> Current
                Company
              </label>
              <input
                {...register("companyName")}
                type="text"
                placeholder="Tech Innovators Inc."
                className="w-full h-12 bg-muted border border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <Calendar className="w-3 h-3 text-primary/60" /> Experience
                (Years)
              </label>
              <input
                {...register("experience")}
                type="number"
                placeholder="5"
                min="0"
                className="w-full h-12 bg-muted border border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <AlertCircle className="w-3 h-3 text-primary/60" /> Notice
                Period (Days)
              </label>
              <input
                {...register("noticePeriod")}
                type="number"
                placeholder="30"
                min="0"
                className="w-full h-12 bg-muted border border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            {/* Salary Constraints */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <DollarSign className="w-3 h-3 text-primary/60" /> Current
                Salary
              </label>
              <input
                {...register("currentSalary")}
                type="number"
                placeholder="e.g. 100000"
                min="0"
                className="w-full h-12 bg-muted border border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <DollarSign className="w-3 h-3 text-primary/60" /> Expected
                Salary
              </label>
              <input
                {...register("expectedSalary")}
                type="number"
                placeholder="e.g. 120000"
                min="0"
                className="w-full h-12 bg-muted border border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            {/* Skills & Background Header */}
            <div className="md:col-span-2 pt-4 border-t border-border">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-2 opacity-50">
                Skills & Background
              </h4>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <Award className="w-3 h-3 text-primary/60" /> Top Skills (Comma
                Separated)
              </label>
              <textarea
                {...register("skills")}
                rows={2}
                placeholder="React, Next.js, Node.js, TypeScript..."
                className="w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <GraduationCap className="w-3 h-3 text-primary/60" /> Education
              </label>
              <textarea
                {...register("education")}
                rows={2}
                placeholder="B.Sc in Computer Science, State University..."
                className="w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <Award className="w-3 h-3 text-primary/60" /> Certifications
              </label>
              <textarea
                {...register("certifications")}
                rows={2}
                placeholder="AWS Certified Solutions Architect, Google Professional Developer..."
                className="w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Links Header */}
            <div className="md:col-span-2 pt-4 border-t border-border">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-2 opacity-50">
                Links & URLs
              </h4>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <FileText className="w-3 h-3 text-primary/60" /> Resume Link
                (Drive/Dropbox/etc.)
              </label>
              <input
                {...register("resume")}
                type="url"
                placeholder="https://docs.google.com/..."
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <LinkIcon className="w-3 h-3 text-primary/60" /> LinkedIn
              </label>
              <input
                {...register("linkedin")}
                type="url"
                placeholder="https://linkedin.com/in/username"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <div className="w-3 h-3 text-primary/60" /> GitHub
              </label>
              <input
                {...register("github")}
                type="url"
                placeholder="https://github.com/username"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                <Globe className="w-3 h-3 text-primary/60" /> Portfolio Website
              </label>
              <input
                {...register("portfolio")}
                type="url"
                placeholder="https://yourportfolio.com"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="md:col-span-2 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl brand-gradient text-white font-extrabold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Saving Professional Details...
                  </>
                ) : (
                  <>
                    Save Professional Details
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalDetailsForm;

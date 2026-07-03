"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Briefcase,
  Mail,
  Lock,
  UserCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z
      .enum(["USER", "EMPLOYER"])
      .refine(Boolean, { message: "Role is required" }),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "EMPLOYER" && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required for employers",
      path: ["companyName"],
    },
  );

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "USER",
      companyName: "",
    },
  });

  const selectedRole = watch("role");

  const handleRole = (value: "USER" | "EMPLOYER") => {
    setValue("role", value, { shouldValidate: true });
    if (error) setError("");
  };

  const handleResumeAutofill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB.");
      return;
    }

    try {
      setParsing(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server returned an unexpected response. Please try again.");
      }

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to parse resume");
      }

      if (json.success && json.data) {
        const { name, email, companyName } = json.data;
        if (name) setValue("name", name, { shouldValidate: true });
        if (email) setValue("email", email, { shouldValidate: true });
        if (companyName && selectedRole === "EMPLOYER") {
          setValue("companyName", companyName, { shouldValidate: true });
        }

        setParsedResumeData(json.data);
        toast.success("Resume parsed! Profile fields pre-filled.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to parse resume. You can still sign up manually.");
    } finally {
      setParsing(false);
    }
  };

  const onSubmit = async (data: SignupValues) => {
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...(parsedResumeData && { parsedResumeData }),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/auth/signin");
    } catch (err: any) {
      const errMsg = err.message || "Something went wrong. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className={cn("w-full max-w-md", className)} {...props}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-foreground">
          Job<span className="brand-text">Portal</span>
        </span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Join thousands connecting Job with opportunity.
        </p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleRole("USER")}
          className={cn(
            "group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200",
            selectedRole === "USER"
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/15"
              : "border-border bg-muted hover:border-primary/30 hover:bg-accent",
          )}
        >
          {selectedRole === "USER" && (
            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-primary" />
          )}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              selectedRole === "USER" ? "bg-primary/20" : "bg-muted",
            )}
          >
            <UserCircle
              className={cn(
                "w-5 h-5",
                selectedRole === "USER" ? "text-primary" : "text-muted-foreground",
              )}
            />
          </div>
          <div className="text-center">
            <p
              className={cn(
                "text-sm font-bold",
                selectedRole === "USER" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Job Seeker
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Find your next role</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleRole("EMPLOYER")}
          className={cn(
            "group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200",
            selectedRole === "EMPLOYER"
              ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/15"
              : "border-border bg-muted hover:border-violet-500/30 hover:bg-accent",
          )}
        >
          {selectedRole === "EMPLOYER" && (
            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-violet-500" />
          )}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              selectedRole === "EMPLOYER" ? "bg-violet-500/20" : "bg-muted",
            )}
          >
            <Briefcase
              className={cn(
                "w-5 h-5",
                selectedRole === "EMPLOYER"
                  ? "text-violet-500"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div className="text-center">
            <p
              className={cn(
                "text-sm font-bold",
                selectedRole === "EMPLOYER"
                  ? "text-violet-500"
                  : "text-muted-foreground",
              )}
            >
              Employer
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Post jobs & hire</p>
          </div>
        </button>
      </div>

      {/* Optional Resume Auto-fill */}
      {selectedRole === "USER" && (
        <div className="mb-6 p-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col gap-3">
          <div>
            <p className="text-sm font-bold text-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Auto-fill Profile (Optional)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a PDF resume to instantly pre-fill your name, email, skills, and more.
            </p>
          </div>
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              id="resume-autofill"
              className="hidden"
              onChange={handleResumeAutofill}
              disabled={parsing}
            />
            <label
              htmlFor="resume-autofill"
              className={cn(
                "flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs cursor-pointer hover:bg-primary/95 transition-colors text-center",
                parsing && "opacity-50 cursor-not-allowed"
              )}
            >
              {parsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  AI parsing your resume...
                </>
              ) : (
                "Upload Resume (PDF)"
              )}
            </label>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-sm animate-in fade-in zoom-in duration-200">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            {selectedRole === "EMPLOYER" ? "Contact Person Name" : "Full Name"}
          </label>
          <Input
            id="name"
            placeholder={
              selectedRole === "EMPLOYER" ? "e.g. John Smith" : "John Doe"
            }
            disabled={isSubmitting}
            className={cn(
              "h-11 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring",
              errors.name &&
                "border-destructive focus:border-destructive focus:ring-destructive/20",
            )}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1 ml-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Company Name (Employer only) */}
        {selectedRole === "EMPLOYER" && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
            <label
              htmlFor="companyName"
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
            >
              <Briefcase className="w-3.5 h-3.5 text-violet-500" />
              Company Name
            </label>
            <Input
              id="companyName"
              placeholder="Your Business Name"
              disabled={isSubmitting}
              className={cn(
                "h-11 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20",
                errors.companyName &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="text-xs text-destructive mt-1 ml-1">
                {errors.companyName.message}
              </p>
            )}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
          >
            <Mail className="w-3.5 h-3.5 text-primary" />
            {selectedRole === "EMPLOYER" ? "Company Email" : "Email"}
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            className={cn(
              "h-11 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring",
              errors.email &&
                "border-destructive focus:border-destructive focus:ring-destructive/20",
            )}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1 ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
            >
              <Lock className="w-3.5 h-3.5 text-primary" />
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                disabled={isSubmitting}
                className={cn(
                  "h-11 pr-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring",
                  errors.password &&
                    "border-destructive focus:border-destructive focus:ring-destructive/20",
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-muted-foreground block"
            >
              Confirm
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                disabled={isSubmitting}
                className={cn(
                  "h-11 pr-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring",
                  errors.confirmPassword &&
                    "border-destructive focus:border-destructive focus:ring-destructive/20",
                )}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1 ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 h-11 mt-2 rounded-xl brand-gradient text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-90 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account…
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

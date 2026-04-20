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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

  const onSubmit = async (data: SignupValues) => {
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      router.push("/auth/signin");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className={cn("w-full max-w-md", className)} {...props}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-white">
          Job<span className="brand-text">Portal</span>
        </span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Create your account
        </h1>
        <p className="text-white/50 text-sm">
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
              ? "border-indigo-500/60 bg-indigo-500/12 shadow-lg shadow-indigo-500/15"
              : "border-white/10 bg-white/4 hover:border-indigo-500/30 hover:bg-white/8",
          )}
        >
          {selectedRole === "USER" && (
            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-indigo-400" />
          )}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              selectedRole === "USER" ? "bg-indigo-500/20" : "bg-white/8",
            )}
          >
            <UserCircle
              className={cn(
                "w-5 h-5",
                selectedRole === "USER" ? "text-indigo-400" : "text-white/40",
              )}
            />
          </div>
          <div className="text-center">
            <p
              className={cn(
                "text-sm font-bold",
                selectedRole === "USER" ? "text-indigo-200" : "text-white/70",
              )}
            >
              Job Seeker
            </p>
            <p className="text-xs text-white/35 mt-0.5">Find your next role</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleRole("EMPLOYER")}
          className={cn(
            "group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200",
            selectedRole === "EMPLOYER"
              ? "border-violet-500/60 bg-violet-500/12 shadow-lg shadow-violet-500/15"
              : "border-white/10 bg-white/4 hover:border-violet-500/30 hover:bg-white/8",
          )}
        >
          {selectedRole === "EMPLOYER" && (
            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-violet-400" />
          )}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              selectedRole === "EMPLOYER" ? "bg-violet-500/20" : "bg-white/8",
            )}
          >
            <Briefcase
              className={cn(
                "w-5 h-5",
                selectedRole === "EMPLOYER"
                  ? "text-violet-400"
                  : "text-white/40",
              )}
            />
          </div>
          <div className="text-center">
            <p
              className={cn(
                "text-sm font-bold",
                selectedRole === "EMPLOYER"
                  ? "text-violet-200"
                  : "text-white/70",
              )}
            >
              Employer
            </p>
            <p className="text-xs text-white/35 mt-0.5">Post jobs & hire</p>
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm animate-in fade-in zoom-in duration-200">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="flex items-center gap-2 text-sm font-semibold text-white/70"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            {selectedRole === "EMPLOYER" ? "Contact Person Name" : "Full Name"}
          </label>
          <Input
            id="name"
            placeholder={
              selectedRole === "EMPLOYER" ? "e.g. John Smith" : "John Doe"
            }
            disabled={isSubmitting}
            className={cn(
              "h-11 bg-white/6 border-white/12 text-white placeholder:text-white/30 focus:border-indigo-500/60 focus:ring-indigo-500/20",
              errors.name &&
                "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10",
            )}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-400 mt-1 ml-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Company Name (Employer only) */}
        {selectedRole === "EMPLOYER" && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
            <label
              htmlFor="companyName"
              className="flex items-center gap-2 text-sm font-semibold text-white/70"
            >
              <Briefcase className="w-3.5 h-3.5 text-violet-400" />
              Company Name
            </label>
            <Input
              id="companyName"
              placeholder="Your Business Name"
              disabled={isSubmitting}
              className={cn(
                "h-11 bg-white/6 border-white/12 text-white placeholder:text-white/30 focus:border-violet-500/60 focus:ring-violet-500/20",
                errors.companyName &&
                  "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10",
              )}
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="text-xs text-red-400 mt-1 ml-1">
                {errors.companyName.message}
              </p>
            )}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-semibold text-white/70"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            {selectedRole === "EMPLOYER" ? "Company Email" : "Email"}
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            className={cn(
              "h-11 bg-white/6 border-white/12 text-white placeholder:text-white/30 focus:border-indigo-500/60 focus:ring-indigo-500/20",
              errors.email &&
                "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10",
            )}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1 ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-sm font-semibold text-white/70"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                disabled={isSubmitting}
                className={cn(
                  "h-11 pr-10 bg-white/6 border-white/12 text-white placeholder:text-white/30 focus:border-indigo-500/60 focus:ring-indigo-500/20",
                  errors.password &&
                    "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10",
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-white/70 block"
            >
              Confirm
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                disabled={isSubmitting}
                className={cn(
                  "h-11 pr-10 bg-white/6 border-white/12 text-white placeholder:text-white/30 focus:border-indigo-500/60 focus:ring-indigo-500/20",
                  errors.confirmPassword &&
                    "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10",
                )}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showConfirmPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 ml-1">
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

      <p className="text-center text-sm text-white/45 mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
